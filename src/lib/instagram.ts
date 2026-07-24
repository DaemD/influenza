import { prisma } from "@/lib/db";
import { decryptSecret, encryptSecret } from "@/lib/crypto";

const GRAPH = "https://graph.instagram.com";
const API_VERSION = process.env.INSTAGRAM_GRAPH_API_VERSION ?? "v21.0";

export type InstagramConfig = {
  appId: string;
  appSecret: string;
  redirectUri: string;
};

export function getInstagramConfig(): InstagramConfig | null {
  const appId = process.env.META_APP_ID || process.env.INSTAGRAM_APP_ID;
  const appSecret = process.env.META_APP_SECRET || process.env.INSTAGRAM_APP_SECRET;
  const redirectUri =
    process.env.META_REDIRECT_URI ||
    process.env.INSTAGRAM_REDIRECT_URI ||
    `${process.env.NEXT_PUBLIC_APP_URL}/api/instagram/callback`;

  if (!appId || !appSecret || !redirectUri) return null;
  return { appId, appSecret, redirectUri };
}

export function isInstagramOAuthConfigured(): boolean {
  return getInstagramConfig() !== null && Boolean(process.env.TOKEN_ENCRYPTION_KEY);
}

/** Scopes for profile + media + engagement insights */
export const INSTAGRAM_SCOPES = [
  "instagram_business_basic",
  "instagram_business_manage_insights",
].join(",");

export function buildInstagramAuthUrl(state: string): string {
  const config = getInstagramConfig();
  if (!config) throw new Error("Instagram OAuth is not configured");

  const params = new URLSearchParams({
    client_id: config.appId,
    redirect_uri: config.redirectUri,
    scope: INSTAGRAM_SCOPES,
    response_type: "code",
    state,
  });

  // Instagram Business Login (Instagram API with Instagram Login)
  return `https://www.instagram.com/oauth/authorize?${params.toString()}`;
}

type ShortLivedToken = {
  access_token: string;
  user_id: string | number;
  permissions?: string[];
};

type LongLivedToken = {
  access_token: string;
  token_type?: string;
  expires_in: number;
};

export type InstagramProfile = {
  id: string;
  username: string;
  name?: string;
  account_type?: string;
  profile_picture_url?: string;
  followers_count?: number;
  follows_count?: number;
  media_count?: number;
  biography?: string;
};

export type InstagramMediaItem = {
  id: string;
  caption?: string;
  media_type: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  timestamp?: string;
  like_count?: number;
  comments_count?: number;
  view_count?: number;
};

export async function exchangeCodeForTokens(code: string): Promise<{
  accessToken: string;
  userId: string;
  expiresIn: number;
}> {
  const config = getInstagramConfig();
  if (!config) throw new Error("Instagram OAuth is not configured");

  const form = new URLSearchParams({
    client_id: config.appId,
    client_secret: config.appSecret,
    grant_type: "authorization_code",
    redirect_uri: config.redirectUri,
    code,
  });

  const shortRes = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });

  const shortJson = (await shortRes.json()) as ShortLivedToken & {
    error_message?: string;
    error_type?: string;
  };

  if (!shortRes.ok || !shortJson.access_token) {
    throw new Error(
      shortJson.error_message ??
        shortJson.error_type ??
        "Failed to exchange Instagram authorization code"
    );
  }

  const longUrl = new URL(`${GRAPH}/access_token`);
  longUrl.searchParams.set("grant_type", "ig_exchange_token");
  longUrl.searchParams.set("client_secret", config.appSecret);
  longUrl.searchParams.set("access_token", shortJson.access_token);

  const longRes = await fetch(longUrl.toString());
  const longJson = (await longRes.json()) as LongLivedToken & {
    error?: { message?: string };
  };

  if (!longRes.ok || !longJson.access_token) {
    // Fall back to short-lived token if long-lived exchange fails
    return {
      accessToken: shortJson.access_token,
      userId: String(shortJson.user_id),
      expiresIn: 60 * 60, // ~1 hour
    };
  }

  return {
    accessToken: longJson.access_token,
    userId: String(shortJson.user_id),
    expiresIn: longJson.expires_in ?? 60 * 60 * 24 * 60,
  };
}

export async function refreshLongLivedToken(accessToken: string): Promise<{
  accessToken: string;
  expiresIn: number;
}> {
  const url = new URL(`${GRAPH}/refresh_access_token`);
  url.searchParams.set("grant_type", "ig_refresh_token");
  url.searchParams.set("access_token", accessToken);

  const res = await fetch(url.toString());
  const json = (await res.json()) as LongLivedToken & { error?: { message?: string } };
  if (!res.ok || !json.access_token) {
    throw new Error(json.error?.message ?? "Failed to refresh Instagram token");
  }
  return {
    accessToken: json.access_token,
    expiresIn: json.expires_in ?? 60 * 60 * 24 * 60,
  };
}

async function graphGet<T>(
  path: string,
  accessToken: string,
  params: Record<string, string> = {}
): Promise<T> {
  const url = new URL(`${GRAPH}/${API_VERSION}/${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  url.searchParams.set("access_token", accessToken);

  const res = await fetch(url.toString());
  const json = await res.json();
  if (!res.ok) {
    const message =
      json?.error?.message ?? json?.error_message ?? `Instagram API error (${res.status})`;
    throw new Error(message);
  }
  return json as T;
}

export async function fetchInstagramProfile(accessToken: string): Promise<InstagramProfile> {
  // Instagram Login returns `user_id` alias as id on /me in some API versions
  const profile = await graphGet<InstagramProfile & { user_id?: string }>("me", accessToken, {
    fields:
      "user_id,username,name,account_type,profile_picture_url,followers_count,follows_count,media_count,biography",
  });

  return {
    ...profile,
    id: String(profile.user_id ?? profile.id),
  };
}

export async function fetchRecentMedia(
  igUserId: string,
  accessToken: string,
  limit = 24
): Promise<InstagramMediaItem[]> {
  const data = await graphGet<{ data?: InstagramMediaItem[] }>(
    `${igUserId}/media`,
    accessToken,
    {
      fields:
        "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count",
      limit: String(limit),
    }
  );
  return data.data ?? [];
}

type InsightsCallResult = {
  mediaId: string;
  mediaType: string;
  ok: boolean;
  views: number | null;
  error?: string;
  /** Token-redacted URL for Meta App Review / debugging */
  requestUrl: string;
};

async function tryFetchMediaViews(
  mediaId: string,
  accessToken: string
): Promise<{ views: number | null; error?: string; requestUrl: string }> {
  const version = API_VERSION;
  const requestUrl = `https://graph.instagram.com/${version}/${mediaId}/insights?metric=views,plays,reach&access_token=REDACTED`;
  try {
    const insights = await graphGet<{
      data?: Array<{ name: string; values?: Array<{ value: number }> }>;
      error?: { message?: string };
    }>(`${mediaId}/insights`, accessToken, { metric: "views,plays,reach" });
    const values = insights.data ?? [];
    const views =
      values.find((v) => v.name === "views")?.values?.[0]?.value ??
      values.find((v) => v.name === "plays")?.values?.[0]?.value ??
      null;
    console.info("[instagram/insights] ok", { mediaId, views, requestUrl });
    return { views, requestUrl };
  } catch (e) {
    const error = e instanceof Error ? e.message : "insights failed";
    console.warn("[instagram/insights] fail", { mediaId, error, requestUrl });
    return { views: null, error, requestUrl };
  }
}

async function enrichMediaWithViews(
  media: InstagramMediaItem[],
  accessToken: string
): Promise<{ media: InstagramMediaItem[]; insights: InsightsCallResult[] }> {
  const enriched: InstagramMediaItem[] = [];
  const insights: InsightsCallResult[] = [];

  for (const item of media) {
    if (item.media_type === "VIDEO" || item.media_type === "REELS") {
      const result = await tryFetchMediaViews(item.id, accessToken);
      insights.push({
        mediaId: item.id,
        mediaType: item.media_type,
        ok: result.views != null && !result.error,
        views: result.views,
        error: result.error,
        requestUrl: result.requestUrl,
      });
      enriched.push({ ...item, view_count: result.views ?? item.view_count });
    } else {
      enriched.push(item);
    }
  }

  return { media: enriched, insights };
}

async function tryFetchAvgReelViews(
  media: InstagramMediaItem[],
  _accessToken: string
): Promise<number> {
  const withViews = media.filter(
    (m) =>
      (m.media_type === "VIDEO" || m.media_type === "REELS") &&
      typeof m.view_count === "number" &&
      m.view_count > 0
  );
  if (!withViews.length) return 0;
  return withViews.reduce((sum, m) => sum + (m.view_count ?? 0), 0) / withViews.length;
}

export function computeEngagementMetrics(
  followers: number,
  media: InstagramMediaItem[],
  avgReelViews = 0
) {
  const withEngagement = media.filter(
    (m) => typeof m.like_count === "number" || typeof m.comments_count === "number"
  );
  const n = withEngagement.length || 1;
  const avgLikes =
    withEngagement.reduce((sum, m) => sum + (m.like_count ?? 0), 0) / n;
  const avgComments =
    withEngagement.reduce((sum, m) => sum + (m.comments_count ?? 0), 0) / n;
  const engagementRate =
    followers > 0 ? ((avgLikes + avgComments) / followers) * 100 : 0;

  return {
    avgLikes,
    avgComments,
    avgReelViews,
    engagementRate: Math.round(engagementRate * 100) / 100,
  };
}

export async function syncInstagramAccountForUser(params: {
  userId: string;
  accessToken: string;
  platformUserId: string;
  expiresIn: number;
}) {
  const { userId, accessToken, platformUserId, expiresIn } = params;

  const profile = await fetchInstagramProfile(accessToken);
  const igId = profile.id || platformUserId;
  const rawMedia = await fetchRecentMedia(igId, accessToken, 24);
  const { media, insights } = await enrichMediaWithViews(rawMedia, accessToken);
  const avgReelViews = await tryFetchAvgReelViews(media, accessToken);
  const metrics = computeEngagementMetrics(
    profile.followers_count ?? 0,
    media,
    avgReelViews
  );

  const insightsDiag = {
    mediaFetched: rawMedia.length,
    videoOrReelCount: insights.length,
    insightsAttempted: insights.length,
    insightsSucceeded: insights.filter((i) => i.ok).length,
    insightsFailed: insights.filter((i) => !i.ok).length,
    sampleRequestUrl: insights[0]?.requestUrl ?? null,
    sampleErrors: insights
      .filter((i) => i.error)
      .slice(0, 3)
      .map((i) => ({ mediaId: i.mediaId, mediaType: i.mediaType, error: i.error })),
  };
  console.info("[instagram/sync] insights summary", insightsDiag);

  let creator = await prisma.creatorProfile.findUnique({ where: { userId } });
  if (!creator) {
    creator = await prisma.creatorProfile.create({
      data: {
        userId,
        displayName: profile.name || profile.username,
        bio: profile.biography ?? null,
      },
    });
  } else if (!creator.displayName || creator.displayName === "Creator") {
    await prisma.creatorProfile.update({
      where: { id: creator.id },
      data: {
        displayName: profile.name || profile.username,
        bio: creator.bio ?? profile.biography ?? null,
      },
    });
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      role: "CREATOR",
      image: profile.profile_picture_url ?? undefined,
      name: profile.name || profile.username,
    },
  });

  const tokenEnc = encryptSecret(accessToken);
  const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);

  // `(platform, username)` is globally unique. Clear seed/demo/soft-deleted rows
  // that hold this handle (or IG user id) so reconnect / real OAuth can succeed.
  const conflicting = await prisma.socialAccount.findMany({
    where: {
      platform: "INSTAGRAM",
      OR: [
        { username: profile.username },
        { platformUserId: igId },
      ],
      NOT: { creatorProfileId: creator.id },
    },
    include: { creatorProfile: { select: { userId: true } } },
  });

  for (const row of conflicting) {
    const isOrphan =
      row.deletedAt != null ||
      !row.accessTokenEnc ||
      row.creatorProfile.userId === userId;

    if (!isOrphan) {
      throw new Error(
        "This Instagram account is already connected to another Influence profile. Disconnect it there first, or use a different Instagram account."
      );
    }

    await prisma.socialAccount.delete({ where: { id: row.id } });
  }

  const accountData = {
    platformUserId: igId,
    username: profile.username,
    displayName: profile.name || profile.username,
    profileImageUrl: profile.profile_picture_url ?? null,
    biography: profile.biography ?? null,
    profileUrl: `https://instagram.com/${profile.username}`,
    isVerifiedByPlatform: false,
    isAnalyticsVerified: true,
    accessTokenEnc: tokenEnc,
    tokenExpiresAt,
    connectedAt: new Date(),
    lastSyncedAt: new Date(),
    deletedAt: null as Date | null,
  };

  const account = await prisma.socialAccount.upsert({
    where: {
      creatorProfileId_platform: {
        creatorProfileId: creator.id,
        platform: "INSTAGRAM",
      },
    },
    create: {
      creatorProfileId: creator.id,
      platform: "INSTAGRAM",
      ...accountData,
    },
    update: accountData,
  });

  await prisma.socialMetric.updateMany({
    where: { socialAccountId: account.id, isCurrent: true },
    data: { isCurrent: false },
  });

  await prisma.socialMetric.create({
    data: {
      socialAccountId: account.id,
      followers: profile.followers_count ?? 0,
      following: profile.follows_count ?? 0,
      mediaCount: profile.media_count ?? media.length,
      engagementRate: metrics.engagementRate,
      avgLikes: metrics.avgLikes,
      avgComments: metrics.avgComments,
      avgReelViews: metrics.avgReelViews,
      isCurrent: true,
    },
  });

  // Replace recent posts snapshot
  await prisma.socialPost.deleteMany({ where: { socialAccountId: account.id } });
  if (media.length) {
    await prisma.socialPost.createMany({
      data: media.map((m) => ({
        socialAccountId: account.id,
        platformPostId: m.id,
        mediaType: m.media_type,
        caption: m.caption ?? null,
        permalink: m.permalink ?? null,
        thumbnailUrl: m.thumbnail_url ?? m.media_url ?? null,
        mediaUrl: m.media_url ?? null,
        likeCount: m.like_count ?? 0,
        commentCount: m.comments_count ?? 0,
        viewCount: m.view_count ?? null,
        postedAt: m.timestamp ? new Date(m.timestamp) : null,
      })),
    });
  }

  await prisma.auditLog.create({
    data: {
      userId,
      action: "instagram.connect",
      entity: "SocialAccount",
      entityId: account.id,
      meta: {
        username: profile.username,
        followers: profile.followers_count ?? 0,
        engagementRate: metrics.engagementRate,
      },
    },
  });

  return {
    accountId: account.id,
    username: profile.username,
    displayName: profile.name || profile.username,
    profileImageUrl: profile.profile_picture_url ?? null,
    followers: profile.followers_count ?? 0,
    engagementRate: metrics.engagementRate,
    avgReelViews: metrics.avgReelViews,
    verified: true,
    insights: insightsDiag,
  };
}

export async function resyncInstagramAccount(socialAccountId: string) {
  const account = await prisma.socialAccount.findUnique({
    where: { id: socialAccountId },
    include: { creatorProfile: true },
  });
  if (!account?.accessTokenEnc || !account.platformUserId) {
    throw new Error("Instagram account is not connected with a stored token");
  }

  let accessToken = decryptSecret(account.accessTokenEnc);
  let expiresIn = 60 * 60 * 24 * 60;

  // Refresh if expiring within 7 days
  if (account.tokenExpiresAt && account.tokenExpiresAt.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000) {
    try {
      const refreshed = await refreshLongLivedToken(accessToken);
      accessToken = refreshed.accessToken;
      expiresIn = refreshed.expiresIn;
    } catch {
      // Continue with existing token; user may need to reconnect
    }
  }

  return syncInstagramAccountForUser({
    userId: account.creatorProfile.userId,
    accessToken,
    platformUserId: account.platformUserId,
    expiresIn,
  });
}
