import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function getSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function requireRole(role: "CREATOR" | "BRAND") {
  const session = await requireSession();
  if (session.user.role !== role) {
    redirect(session.user.role === "CREATOR" ? "/creator" : "/brand/discover");
  }
  return session;
}
