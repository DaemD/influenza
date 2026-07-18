import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const participants = await prisma.conversationParticipant.findMany({
    where: { userId: session.user.id },
    include: {
      conversation: {
        include: {
          participants: {
            include: { user: { select: { id: true, name: true, image: true } } },
          },
          messages: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      },
    },
    orderBy: { conversation: { lastMessageAt: "desc" } },
  });

  const conversations = participants.map((p) => {
    const others = p.conversation.participants.filter((x) => x.userId !== session.user.id);
    return {
      id: p.conversation.id,
      lastMessageAt: p.conversation.lastMessageAt,
      lastMessage: p.conversation.messages[0] ?? null,
      otherUser: others[0]?.user ?? null,
    };
  });

  return NextResponse.json({ conversations });
}
