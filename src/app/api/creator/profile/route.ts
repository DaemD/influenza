import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { store } from "@/lib/store";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const profile = store.upsertCreatorProfile(session.user.id, {
    displayName: body.displayName,
    bio: body.bio,
    city: body.city,
    location: body.location,
    categories: body.categories,
    languages: body.languages,
    storyPricePkr: body.storyPricePkr,
    reelPricePkr: body.reelPricePkr,
    postPricePkr: body.postPricePkr,
    bundlePricePkr: body.bundlePricePkr,
    completeOnboarding: Boolean(body.completeOnboarding),
  });

  return NextResponse.json({ profile });
}

export async function GET() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = store.getCreatorByUserId(session.user.id);
  if (!profile) return NextResponse.json({ profile: null });

  return NextResponse.json({
    profile: {
      ...profile,
      socialAccounts: [
        {
          id: `ig_${profile.id}`,
          platform: "INSTAGRAM",
          username: profile.username,
          isAnalyticsVerified: profile.verified,
          metrics: [{ followers: profile.followers, engagementRate: profile.engagementRate }],
          posts: profile.posts,
        },
      ],
      portfolioItems: [],
    },
  });
}
