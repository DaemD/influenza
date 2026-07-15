import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { verifyOAuthState } from "@/lib/crypto";
import { exchangeCodeForTokens, syncInstagramAccountForUser } from "@/lib/instagram";
import { absoluteAppUrl } from "@/lib/app-url";

function redirectWithError(req: Request, returnTo: string, message: string) {
  const url = absoluteAppUrl(returnTo, req);
  url.searchParams.set("instagram", "error");
  url.searchParams.set("message", message.slice(0, 180));
  console.error("[instagram/callback] redirect error:", message, "→", url.toString());
  return NextResponse.redirect(url);
}

export async function GET(req: Request) {
  const session = await getSession();
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorReason = searchParams.get("error_reason");
  const errorDescription = searchParams.get("error_description");

  const statePayload = state ? verifyOAuthState(state) : null;
  const returnTo = statePayload?.returnTo ?? "/onboarding/creator";

  if (error) {
    return redirectWithError(
      req,
      returnTo,
      errorDescription || errorReason || error || "Instagram authorization was denied"
    );
  }

  if (!session?.user) {
    return NextResponse.redirect(absoluteAppUrl("/login", req));
  }

  if (!code || !statePayload) {
    return redirectWithError(req, returnTo, "Invalid or expired Instagram OAuth state");
  }

  if (statePayload.userId !== session.user.id) {
    return redirectWithError(req, returnTo, "OAuth state does not match the signed-in user");
  }

  // Reject stale states (> 30 min)
  const ts = Number(statePayload.ts ?? 0);
  if (!ts || Date.now() - ts > 30 * 60 * 1000) {
    return redirectWithError(req, returnTo, "OAuth state expired — try connecting again");
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const synced = await syncInstagramAccountForUser({
      userId: session.user.id,
      accessToken: tokens.accessToken,
      platformUserId: tokens.userId,
      expiresIn: tokens.expiresIn,
    });

    const url = absoluteAppUrl(returnTo, req);
    url.searchParams.set("instagram", "connected");
    console.log(
      "[instagram/callback] connected @" + synced.username + " →",
      url.toString()
    );
    return NextResponse.redirect(url);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to connect Instagram";
    console.error("[instagram/callback]", message);
    return redirectWithError(req, returnTo, message);
  }
}
