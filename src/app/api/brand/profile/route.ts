import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { store } from "@/lib/store";

export async function GET() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ profile: store.getBrand(session.user.id) });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  if (!body.companyName?.trim()) {
    return NextResponse.json({ error: "Company name required" }, { status: 400 });
  }

  const profile = store.upsertBrand(session.user.id, {
    companyName: body.companyName,
    website: body.website || null,
    industry: body.industry || null,
    bio: body.bio || null,
    isOnboarded: true,
  });

  return NextResponse.json({ profile });
}
