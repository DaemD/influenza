import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;

  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: { conversationId: id, userId: session.user.id },
    },
  });
  if (!participant) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const messages = await prisma.message.findMany({
    where: { conversationId: id, deletedAt: null },
    orderBy: { createdAt: "asc" },
    include: { sender: { select: { id: true, name: true, image: true } } },
  });

  await prisma.conversationParticipant.update({
    where: { id: participant.id },
    data: { lastReadAt: new Date() },
  });

  return NextResponse.json({ messages });
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const body = await req.json();

  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: { conversationId: id, userId: session.user.id },
    },
  });
  if (!participant) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const message = await prisma.message.create({
    data: {
      conversationId: id,
      senderId: session.user.id,
      body: body.body,
      type: body.type ?? "TEXT",
      attachmentUrl: body.attachmentUrl,
    },
  });

  await prisma.conversation.update({
    where: { id },
    data: { lastMessageAt: new Date() },
  });

  const others = await prisma.conversationParticipant.findMany({
    where: { conversationId: id, userId: { not: session.user.id } },
  });
  await prisma.notification.createMany({
    data: others.map((o) => ({
      userId: o.userId,
      type: "NEW_MESSAGE" as const,
      title: "New message",
      body: body.body?.slice(0, 100),
      href: session.user.role === "BRAND" ? "/brand/messages" : "/creator/messages",
    })),
  });

  return NextResponse.json({ message });
}
