import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { resyncInstagramAccount } from "@/lib/instagram";

export async function POST() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      socialAccounts: {
        where: { platform: "INSTAGRAM", deletedAt: null, accessTokenEnc: { not: null } },
        take: 1,
      },
    },
  });

  const account = profile?.socialAccounts[0];
  if (!account) {
    return NextResponse.json(
      { error: "No Instagram account with a stored OAuth token. Connect Instagram first." },
      { status: 400 }
    );
  }

  try {
    const result = await resyncInstagramAccount(account.id);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
