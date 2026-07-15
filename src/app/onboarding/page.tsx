import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function OnboardingIndex() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.user.role === "CREATOR") redirect("/onboarding/creator");
  if (session.user.role === "BRAND") redirect("/onboarding/brand");
  redirect("/signup");
}
