import { requireRole } from "@/lib/session";
import { InstagramSettings } from "@/components/instagram-settings";

export default async function CreatorSettingsPage() {
  const session = await requireRole("CREATOR");
  return <InstagramSettings email={session.user.email} />;
}
