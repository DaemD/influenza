import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isInstagramOAuthConfigured } from "@/lib/instagram";
import { store } from "@/lib/store";

export async function GET() {
  const configured = isInstagramOAuthConfigured();
  const session = await getSession();

  if (!session?.user) {
    return NextResponse.json({ configured, connected: false });
  }

  const ig = store.getIgStatus(session.user.id);
  return NextResponse.json({
    configured,
    connected: Boolean(ig),
    account: ig
      ? {
          username: ig.username,
          displayName: ig.displayName,
          profileImageUrl: ig.profileImageUrl,
          verified: ig.verified,
          lastSyncedAt: ig.lastSyncedAt,
          followers: ig.followers,
          engagementRate: ig.engagementRate,
          hasRealToken: ig.hasRealToken,
        }
      : null,
  });
}
