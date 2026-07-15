import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  buildInstagramAuthUrl,
  isInstagramOAuthConfigured,
} from "@/lib/instagram";
import { signOAuthState } from "@/lib/crypto";
import { absoluteAppUrl } from "@/lib/app-url";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.redirect(absoluteAppUrl("/login", req));
  }

  if (!isInstagramOAuthConfigured()) {
    return NextResponse.json(
      {
        error: "Instagram OAuth is not configured",
        hint: "Set META_APP_ID, META_APP_SECRET, META_REDIRECT_URI, and TOKEN_ENCRYPTION_KEY in .env",
      },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(req.url);
  const returnTo = searchParams.get("returnTo") ?? "/onboarding/creator";

  const state = signOAuthState({
    userId: session.user.id,
    returnTo,
    nonce: crypto.randomUUID(),
    ts: String(Date.now()),
  });

  const authUrl = buildInstagramAuthUrl(state);
  return NextResponse.redirect(authUrl);
}
