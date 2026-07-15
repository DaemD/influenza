import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  const profile = await prisma.creatorProfile.findFirst({
    where: { id, deletedAt: null, isDiscoverable: true },
    include: {
      socialAccounts: {
        where: { deletedAt: null },
        include: {
          metrics: { where: { isCurrent: true }, take: 1 },
          posts: { orderBy: { postedAt: "desc" }, take: 24 },
        },
      },
      portfolioItems: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" } },
      user: {
        include: {
          reviewsReceived: {
            where: { deletedAt: null },
            orderBy: { createdAt: "desc" },
            take: 10,
            include: { reviewer: { select: { name: true, image: true } } },
          },
        },
      },
    },
  });

  if (!profile) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ profile });
}
