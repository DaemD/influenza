import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { store } from "@/lib/store";

export async function GET() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ conversations: store.listConversations(session.user.id) });
}
