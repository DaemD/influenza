import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { store } from "@/lib/store";

export async function GET() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ notifications: store.listNotifications(session.user.id) });
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  if (body.markAllRead) {
    store.markNotificationsRead(session.user.id, true);
  } else if (body.id) {
    store.markNotificationsRead(session.user.id, body.id);
  }
  return NextResponse.json({ ok: true });
}
