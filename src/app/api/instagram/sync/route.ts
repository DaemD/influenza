import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { store } from "@/lib/store";

export async function POST() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ig = store.getIgStatus(session.user.id);
  if (!ig) {
    return NextResponse.json(
      { error: "No Instagram account connected. Use Connect Instagram first." },
      { status: 400 }
    );
  }

  // No DB — just bump demo metrics
  ig.followers = Math.max(1000, ig.followers + Math.floor(Math.random() * 500));
  ig.engagementRate = Math.round((2 + Math.random() * 4) * 10) / 10;
  ig.lastSyncedAt = new Date().toISOString();

  const profile = store.getCreatorByUserId(session.user.id);
  if (profile) {
    profile.followers = ig.followers;
    profile.engagementRate = ig.engagementRate;
  }

  return NextResponse.json({
    ok: true,
    username: ig.username,
    followers: ig.followers,
    engagementRate: ig.engagementRate,
    verified: true,
  });
}
