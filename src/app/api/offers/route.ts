import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "BRAND") {
    const offers = await prisma.offer.findMany({
      where: { brandUserId: session.user.id, deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        creatorProfile: {
          include: {
            socialAccounts: {
              where: { platform: "INSTAGRAM" },
              take: 1,
            },
          },
        },
      },
    });
    return NextResponse.json({ offers });
  }

  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) return NextResponse.json({ offers: [] });

  const offers = await prisma.offer.findMany({
    where: { creatorProfileId: profile.id, deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: {
      brandUser: { include: { brandProfile: true } },
    },
  });
  return NextResponse.json({ offers });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "BRAND") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  if (!body.creatorProfileId || !body.title || !body.budgetPkr) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const creator = await prisma.creatorProfile.findFirst({
    where: { id: body.creatorProfileId, deletedAt: null },
  });
  if (!creator) {
    return NextResponse.json({ error: "Creator not found" }, { status: 404 });
  }

  const conversation = await prisma.conversation.create({
    data: {
      participants: {
        create: [
          { userId: session.user.id },
          { userId: creator.userId },
        ],
      },
      messages: {
        create: {
          senderId: session.user.id,
          type: "OFFER_UPDATE",
          body: `Offer sent: ${body.title}`,
        },
      },
    },
  });

  const offer = await prisma.offer.create({
    data: {
      brandUserId: session.user.id,
      creatorProfileId: body.creatorProfileId,
      title: body.title,
      description: body.description ?? "",
      deliverables: body.deliverables ?? [],
      budgetPkr: Number(body.budgetPkr),
      deadline: body.deadline ? new Date(body.deadline) : null,
      conversationId: conversation.id,
    },
  });

  await prisma.notification.create({
    data: {
      userId: creator.userId,
      type: "OFFER_RECEIVED",
      title: "New offer received",
      body: body.title,
      href: "/creator/offers",
    },
  });

  return NextResponse.json({ offer });
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const offer = await prisma.offer.findUnique({
    where: { id: body.id },
    include: { creatorProfile: true },
  });
  if (!offer) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isCreator = offer.creatorProfile.userId === session.user.id;
  const isBrand = offer.brandUserId === session.user.id;
  if (!isCreator && !isBrand) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const status = body.status as string;
  const data: {
    status?: "ACCEPTED" | "DECLINED" | "COUNTERED" | "COMPLETED" | "CANCELLED";
    counterBudgetPkr?: number;
    counterMessage?: string;
  } = {};

  if (status === "ACCEPTED" || status === "DECLINED") {
    if (!isCreator) {
      return NextResponse.json({ error: "Only creator can accept/decline" }, { status: 403 });
    }
    data.status = status;
  } else if (status === "COUNTERED") {
    if (!isCreator) {
      return NextResponse.json({ error: "Only creator can counter" }, { status: 403 });
    }
    data.status = "COUNTERED";
    data.counterBudgetPkr = body.counterBudgetPkr;
    data.counterMessage = body.counterMessage;
  } else if (status === "CANCELLED" && isBrand) {
    data.status = "CANCELLED";
  } else if (status === "COMPLETED") {
    data.status = "COMPLETED";
  }

  const updated = await prisma.offer.update({
    where: { id: offer.id },
    data,
  });

  const notifyUserId = isCreator ? offer.brandUserId : offer.creatorProfile.userId;
  if (status === "ACCEPTED" || status === "DECLINED" || status === "COUNTERED") {
    await prisma.notification.create({
      data: {
        userId: notifyUserId,
        type:
          status === "ACCEPTED"
            ? "OFFER_ACCEPTED"
            : status === "DECLINED"
              ? "OFFER_DECLINED"
              : "OFFER_COUNTERED",
        title: `Offer ${status.toLowerCase()}`,
        body: offer.title,
        href: isCreator ? "/brand/offers" : "/creator/offers",
      },
    });
  }

  return NextResponse.json({ offer: updated });
}
