import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

/** Demo Instagram connect until Meta OAuth credentials are configured. */
export async function POST() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const username =
    session.user.name?.toLowerCase().replace(/\s+/g, "_") ??
    `creator_${session.user.id.slice(0, 6)}`;

  let profile = await prisma.creatorProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    profile = await prisma.creatorProfile.create({
      data: {
        userId: session.user.id,
        displayName: session.user.name,
      },
    });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { role: "CREATOR" },
  });

  const account = await prisma.socialAccount.upsert({
    where: {
      creatorProfileId_platform: {
        creatorProfileId: profile.id,
        platform: "INSTAGRAM",
      },
    },
    create: {
      creatorProfileId: profile.id,
      platform: "INSTAGRAM",
      username,
      displayName: session.user.name,
      profileImageUrl: session.user.image,
      profileUrl: `https://instagram.com/${username}`,
      isAnalyticsVerified: true,
      lastSyncedAt: new Date(),
    },
    update: {
      isAnalyticsVerified: true,
      lastSyncedAt: new Date(),
      deletedAt: null,
    },
  });

  await prisma.socialMetric.updateMany({
    where: { socialAccountId: account.id, isCurrent: true },
    data: { isCurrent: false },
  });

  await prisma.socialMetric.create({
    data: {
      socialAccountId: account.id,
      followers: 12500 + Math.floor(Math.random() * 40000),
      following: 420,
      mediaCount: 186,
      engagementRate: 2.4 + Math.random() * 3,
      avgLikes: 800 + Math.floor(Math.random() * 2000),
      avgComments: 40 + Math.floor(Math.random() * 120),
      avgReelViews: 8000 + Math.floor(Math.random() * 40000),
      isCurrent: true,
    },
  });

  return NextResponse.json({
    ok: true,
    displayName: session.user.name,
    username,
    verified: true,
  });
}
