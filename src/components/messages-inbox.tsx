"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type Conversation = {
  id: string;
  lastMessageAt: string;
  lastMessage: { body: string | null } | null;
  otherUser: { id: string; name: string; image: string | null } | null;
};

type Message = {
  id: string;
  body: string | null;
  senderId: string;
  createdAt: string;
  sender: { id: string; name: string };
};

export function MessagesInbox({ currentUserId }: { currentUserId?: string }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await fetch("/api/messages");
      return res.json() as Promise<{ conversations: Conversation[] }>;
    },
  });

  const { data: thread } = useQuery({
    queryKey: ["messages", activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const res = await fetch(`/api/messages/${activeId}`);
      return res.json() as Promise<{ messages: Message[] }>;
    },
  });

  const send = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/messages/${activeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (!res.ok) throw new Error("Send failed");
      return res.json();
    },
    onSuccess: () => {
      setBody("");
      qc.invalidateQueries({ queryKey: ["messages", activeId] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const conversations = data?.conversations ?? [];

  return (
    <div className="grid h-[calc(100vh-10rem)] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm lg:grid-cols-[280px_1fr]">
      <div className="border-b border-neutral-100 lg:border-b-0 lg:border-r">
        <div className="border-b border-neutral-100 px-4 py-3">
          <h2 className="text-sm font-semibold">Messages</h2>
        </div>
        <ScrollArea className="h-[200px] lg:h-[calc(100%-49px)]">
          {conversations.length === 0 ? (
            <p className="p-4 text-sm text-neutral-500">No conversations yet.</p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveId(c.id)}
                className={cn(
                  "flex w-full flex-col gap-0.5 border-b border-neutral-50 px-4 py-3 text-left transition-colors duration-200 hover:bg-neutral-50",
                  activeId === c.id && "bg-neutral-50"
                )}
              >
                <span className="text-sm font-medium">{c.otherUser?.name ?? "Conversation"}</span>
                <span className="truncate text-xs text-neutral-400">
                  {c.lastMessage?.body ?? "No messages"}
                </span>
              </button>
            ))
          )}
        </ScrollArea>
      </div>

      <div className="flex flex-col">
        {activeId ? (
          <>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {(thread?.messages ?? []).map((m) => {
                  const mine = m.senderId === currentUserId;
                  return (
                    <div
                      key={m.id}
                      className={cn("flex", mine ? "justify-end" : "justify-start")}
                    >
                      <div
                        className={cn(
                          "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm",
                          mine ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-900"
                        )}
                      >
                        <p>{m.body}</p>
                        <p className={cn("mt-1 text-[10px]", mine ? "text-neutral-400" : "text-neutral-400")}>
                          {format(new Date(m.createdAt), "MMM d, HH:mm")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
            <form
              className="flex gap-2 border-t border-neutral-100 p-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (body.trim()) send.mutate();
              }}
            >
              <Input
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write a message…"
                className="h-11 rounded-xl"
              />
              <Button type="submit" className="h-11 rounded-xl" disabled={send.isPending}>
                Send
              </Button>
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-neutral-400">
            Select a conversation
          </div>
        )}
      </div>
    </div>
  );
}
