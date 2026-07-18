import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const creator = store.getCreator(id);
  if (!creator || !creator.isDiscoverable) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    profile: {
      id: creator.id,
      displayName: creator.displayName,
      bio: creator.bio,
      location: creator.location,
      categories: creator.categories,
      languages: creator.languages,
      storyPricePkr: creator.storyPricePkr,
      reelPricePkr: creator.reelPricePkr,
      postPricePkr: creator.postPricePkr,
      bundlePricePkr: creator.bundlePricePkr,
      priceFromPkr: creator.priceFromPkr,
      averageRating: creator.averageRating,
      reviewCount: creator.reviewCount,
      portfolioItems: [],
      socialAccounts: [
        {
          id: `ig_${creator.id}`,
          platform: "INSTAGRAM",
          username: creator.username,
          displayName: creator.displayName,
          profileImageUrl: creator.photoUrl,
          isAnalyticsVerified: creator.verified,
          metrics: [
            {
              followers: creator.followers,
              engagementRate: creator.engagementRate,
            },
          ],
          posts: creator.posts,
        },
      ],
      user: {
        reviewsReceived: [],
      },
    },
  });
}
