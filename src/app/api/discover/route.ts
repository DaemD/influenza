import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const category = searchParams.get("category");
  const city = searchParams.get("city");
  const verifiedOnly = searchParams.get("verified") === "1";
  const minFollowers = Number(searchParams.get("minFollowers") || 0);
  const maxFollowers = Number(searchParams.get("maxFollowers") || 0);
  const minEngagement = Number(searchParams.get("minEngagement") || 0);
  const maxPrice = Number(searchParams.get("maxPrice") || 0);
  const sort = searchParams.get("sort") ?? "relevant";

  const where: Prisma.CreatorProfileWhereInput = {
    deletedAt: null,
    isDiscoverable: true,
    isOnboarded: true,
  };

  if (q) {
    where.OR = [
      { displayName: { contains: q, mode: "insensitive" } },
      { bio: { contains: q, mode: "insensitive" } },
      { location: { contains: q, mode: "insensitive" } },
      { socialAccounts: { some: { username: { contains: q, mode: "insensitive" } } } },
    ];
  }
  if (category) where.categories = { has: category };
  if (city) where.city = city;
  if (maxPrice > 0) where.priceFromPkr = { lte: maxPrice };

  if (verifiedOnly || minFollowers || maxFollowers || minEngagement) {
    where.socialAccounts = {
      some: {
        deletedAt: null,
        ...(verifiedOnly ? { isAnalyticsVerified: true } : {}),
        metrics: {
          some: {
            isCurrent: true,
            ...(minFollowers ? { followers: { gte: minFollowers } } : {}),
            ...(maxFollowers ? { followers: { lte: maxFollowers } } : {}),
            ...(minEngagement ? { engagementRate: { gte: minEngagement } } : {}),
          },
        },
      },
    };
  }

  let orderBy: Prisma.CreatorProfileOrderByWithRelationInput = { createdAt: "desc" };
  if (sort === "price") orderBy = { priceFromPkr: "asc" };
  if (sort === "rating") orderBy = { averageRating: "desc" };
  if (sort === "newest") orderBy = { createdAt: "desc" };

  const creators = await prisma.creatorProfile.findMany({
    where,
    orderBy,
    take: 48,
    include: {
      socialAccounts: {
        where: { platform: "INSTAGRAM", deletedAt: null },
        take: 1,
        include: { metrics: { where: { isCurrent: true }, take: 1 } },
      },
    },
  });

  let results = creators.map((c) => {
    const ig = c.socialAccounts[0];
    const metrics = ig?.metrics[0];
    return {
      id: c.id,
      displayName: c.displayName,
      username: ig?.username ?? "creator",
      location: c.location,
      categories: c.categories,
      priceFromPkr: c.priceFromPkr,
      averageRating: c.averageRating,
      verified: ig?.isAnalyticsVerified ?? false,
      photoUrl: ig?.profileImageUrl ?? null,
      followers: metrics?.followers ?? 0,
      engagementRate: metrics?.engagementRate ?? 0,
      bio: c.bio,
    };
  });

  if (sort === "engagement") {
    results = results.sort((a, b) => b.engagementRate - a.engagementRate);
  }
  if (sort === "followers") {
    results = results.sort((a, b) => b.followers - a.followers);
  }

  return NextResponse.json({ creators: results });
}
