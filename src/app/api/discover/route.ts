import { NextResponse } from "next/server";
import { store } from "@/lib/store";

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

  const creators = store.listCreators({
    q,
    category,
    city,
    verifiedOnly,
    minFollowers,
    maxFollowers,
    minEngagement,
    maxPrice,
    sort,
  });

  return NextResponse.json({
    creators: creators.map((c) => ({
      id: c.id,
      displayName: c.displayName,
      username: c.username,
      location: c.location,
      categories: c.categories,
      priceFromPkr: c.priceFromPkr,
      averageRating: c.averageRating,
      verified: c.verified,
      photoUrl: c.photoUrl,
      followers: c.followers,
      engagementRate: c.engagementRate,
      bio: c.bio,
    })),
  });
}
