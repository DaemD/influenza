import { requireRole } from "@/lib/session";
import { MessagesInbox } from "@/components/messages-inbox";

export default async function CreatorMessagesPage() {
  const session = await requireRole("CREATOR");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
        <p className="mt-1 text-sm text-neutral-500">Chat with brands about active collaborations.</p>
      </div>
      <MessagesInbox currentUserId={session.user.id} />
    </div>
  );
}
