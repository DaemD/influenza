import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { store } from "@/lib/store";

export async function GET() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ saved: store.listSaved(session.user.id) });
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

  return NextResponse.json({ saved: store.saveCreator(session.user.id, creatorProfileId) });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { creatorProfileId } = await req.json();
  store.unsaveCreator(session.user.id, creatorProfileId);
  return NextResponse.json({ ok: true });
}
