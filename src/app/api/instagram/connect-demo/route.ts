import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { store } from "@/lib/store";

/** Demo Instagram connect — no database / no Meta required. */
export async function POST() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const account = store.connectIgDemo(session.user.id, session.user.name ?? "Creator");

  return NextResponse.json({
    ok: true,
    displayName: account.displayName,
    username: account.username,
    verified: true,
  });
}
