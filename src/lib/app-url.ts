/** Public site origin (ngrok / production). Falls back to request Host headers. */
export function getPublicAppOrigin(req?: Request): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL;
  if (fromEnv) {
    try {
      return new URL(fromEnv).origin;
    } catch {
      // ignore
    }
  }

  if (req) {
    const proto = req.headers.get("x-forwarded-proto") ?? "http";
    const host =
      req.headers.get("x-forwarded-host") ??
      req.headers.get("host") ??
      "localhost:3000";
    return `${proto.split(",")[0].trim()}://${host.split(",")[0].trim()}`;
  }

  return "http://localhost:3000";
}

export function absoluteAppUrl(path: string, req?: Request): URL {
  const origin = getPublicAppOrigin(req);
  return new URL(path.startsWith("/") ? path : `/${path}`, origin);
}
