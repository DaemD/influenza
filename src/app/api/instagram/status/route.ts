import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { isInstagramOAuthConfigured } from "@/lib/instagram";

export async function GET() {
  const configured = isInstagramOAuthConfigured();
  const session = await getSession();

  if (!session?.user) {
    return NextResponse.json({ configured, connected: false });
  }

  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      socialAccounts: {
        where: { platform: "INSTAGRAM", deletedAt: null },
        include: { metrics: { where: { isCurrent: true }, take: 1 } },
        take: 1,
      },
    },
  });

  const ig = profile?.socialAccounts[0];
  const metrics = ig?.metrics[0];

  return NextResponse.json({
    configured,
    connected: Boolean(ig),
    account: ig
      ? {
          username: ig.username,
          displayName: ig.displayName,
          profileImageUrl: ig.profileImageUrl,
          verified: ig.isAnalyticsVerified,
          lastSyncedAt: ig.lastSyncedAt,
          followers: metrics?.followers ?? 0,
          engagementRate: metrics?.engagementRate ?? 0,
          hasRealToken: Boolean(ig.accessTokenEnc),
        }
      : null,
  });
}
