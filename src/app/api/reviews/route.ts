import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

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

  const review = await prisma.review.create({
    data: {
      reviewerId: session.user.id,
      revieweeId: body.revieweeId,
      offerId: body.offerId ?? null,
      rating,
      comment: body.comment ?? null,
    },
  });

  const agg = await prisma.review.aggregate({
    where: { revieweeId: body.revieweeId, deletedAt: null },
    _avg: { rating: true },
    _count: true,
  });

  const creator = await prisma.creatorProfile.findUnique({
    where: { userId: body.revieweeId },
  });
  if (creator) {
    await prisma.creatorProfile.update({
      where: { id: creator.id },
      data: {
        averageRating: agg._avg.rating ?? 0,
        reviewCount: agg._count,
      },
    });
  }

  await prisma.notification.create({
    data: {
      userId: body.revieweeId,
      type: "REVIEW_RECEIVED",
      title: "New review",
      body: body.comment?.slice(0, 100),
    },
  });

  return NextResponse.json({ review });
}
