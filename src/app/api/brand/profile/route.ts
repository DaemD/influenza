import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  if (!body.companyName?.trim()) {
    return NextResponse.json({ error: "Company name required" }, { status: 400 });
  }

  const profile = await prisma.brandProfile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      companyName: body.companyName,
      website: body.website || null,
      industry: body.industry || null,
      bio: body.bio || null,
      isOnboarded: true,
    },
    update: {
      companyName: body.companyName,
      website: body.website || null,
      industry: body.industry || null,
      bio: body.bio || null,
      isOnboarded: true,
    },
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { role: "BRAND" },
  });

  return NextResponse.json({ profile });
}
