import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const prices = [
    body.storyPricePkr,
    body.reelPricePkr,
    body.postPricePkr,
    body.bundlePricePkr,
  ].filter((p): p is number => typeof p === "number" && p > 0);
  const priceFromPkr = prices.length ? Math.min(...prices) : null;

  const profile = await prisma.creatorProfile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      displayName: body.displayName,
      bio: body.bio ?? null,
      city: body.city ?? null,
      location: body.location ?? null,
      categories: body.categories ?? [],
      languages: body.languages ?? [],
      storyPricePkr: body.storyPricePkr ?? null,
      reelPricePkr: body.reelPricePkr ?? null,
      postPricePkr: body.postPricePkr ?? null,
      bundlePricePkr: body.bundlePricePkr ?? null,
      priceFromPkr,
      isOnboarded: Boolean(body.completeOnboarding),
      isDiscoverable: Boolean(body.completeOnboarding),
    },
    update: {
      displayName: body.displayName,
      bio: body.bio ?? null,
      city: body.city ?? null,
      location: body.location ?? null,
      categories: body.categories ?? [],
      languages: body.languages ?? [],
      storyPricePkr: body.storyPricePkr ?? null,
      reelPricePkr: body.reelPricePkr ?? null,
      postPricePkr: body.postPricePkr ?? null,
      bundlePricePkr: body.bundlePricePkr ?? null,
      priceFromPkr,
      ...(body.completeOnboarding
        ? { isOnboarded: true, isDiscoverable: true }
        : {}),
    },
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { role: "CREATOR", name: body.displayName },
  });

  return NextResponse.json({ profile });
}

export async function GET() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      socialAccounts: {
        where: { deletedAt: null },
        include: {
          metrics: { where: { isCurrent: true }, take: 1 },
          posts: { orderBy: { postedAt: "desc" }, take: 12 },
        },
      },
      portfolioItems: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" } },
    },
  });

  return NextResponse.json({ profile });
}
