import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const saved = await prisma.savedCreator.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      creatorProfile: {
        include: {
          socialAccounts: {
            where: { platform: "INSTAGRAM", deletedAt: null },
            take: 1,
            include: { metrics: { where: { isCurrent: true }, take: 1 } },
          },
        },
      },
    },
  });

  return NextResponse.json({ saved });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "BRAND") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { creatorProfileId } = await req.json();
  if (!creatorProfileId) {
    return NextResponse.json({ error: "Missing creatorProfileId" }, { status: 400 });
  }

  const saved = await prisma.savedCreator.upsert({
    where: {
      userId_creatorProfileId: { userId: session.user.id, creatorProfileId },
    },
    create: { userId: session.user.id, creatorProfileId },
    update: {},
  });

  return NextResponse.json({ saved });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { creatorProfileId } = await req.json();
  await prisma.savedCreator.deleteMany({
    where: { userId: session.user.id, creatorProfileId },
  });
  return NextResponse.json({ ok: true });
}
