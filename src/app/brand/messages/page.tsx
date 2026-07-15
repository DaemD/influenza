import { requireRole } from "@/lib/session";
import { MessagesInbox } from "@/components/messages-inbox";

export default async function BrandMessagesPage() {
  const session = await requireRole("BRAND");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
        <p className="mt-1 text-sm text-neutral-500">LinkedIn-style inbox for creator conversations.</p>
      </div>
      <MessagesInbox currentUserId={session.user.id} />
    </div>
  );
}
