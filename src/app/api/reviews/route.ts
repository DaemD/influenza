import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { store } from "@/lib/store";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const rating = Number(body.rating);
  if (!body.revieweeId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Invalid review" }, { status: 400 });
  }

  const creator = store.getCreatorByUserId(body.revieweeId);
  if (creator) {
    const total = creator.averageRating * creator.reviewCount + rating;
    creator.reviewCount += 1;
    creator.averageRating = Math.round((total / creator.reviewCount) * 10) / 10;
  }

  store.addNotification({
    userId: body.revieweeId,
    type: "REVIEW_RECEIVED",
    title: "New review",
    body: body.comment?.slice(0, 100) ?? null,
  });

  return NextResponse.json({
    review: {
      id: `review_${Date.now()}`,
      rating,
      comment: body.comment ?? null,
    },
  });
}
