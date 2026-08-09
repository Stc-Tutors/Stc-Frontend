"use client";

import { useEffect, useRef, useState } from "react";
import { MessagesSquare, Send, ShieldCheck } from "lucide-react";
import { useUser } from "@/contexts/user-context";
import {
  GetConversationsAction,
  GetMessagesAction,
  SendMessageAction,
  StartSupportConversationAction,
  MarkConversationReadAction,
} from "@/server/message";
import { Message } from "@/types/message";

// Every non-admin role has exactly one conversation: a shared thread with the
// admin team. There's no recipient picker because there's nothing to pick -
// tutors, parents, and students can't message each other directly. This is a
// deliberate platform safety boundary, not a UI limitation - keep it that way
// even while polishing the look of this single thread.
export default function MessagesPanel() {
  const { user } = useUser();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadThread = async (id: string) => {
    const [res] = await GetMessagesAction(id);
    setMessages(res?.data ?? []);
    await MarkConversationReadAction(id);
  };

  useEffect(() => {
    const init = async () => {
      const [res] = await GetConversationsAction();
      const existing = res?.data?.[0];
      if (existing) {
        setConversationId(existing.id);
        await loadThread(existing.id);
      }
      setIsLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleStart = async () => {
    setIsLoading(true);
    const [res, err] = await StartSupportConversationAction();
    setIsLoading(false);
    if (err || !res?.data) {
      setError(err || "Could not start conversation");
      return;
    }
    setConversationId(res.data.id);
    await loadThread(res.data.id);
  };

  const handleSend = async () => {
    if (!conversationId || !body.trim() || isSending) return;
    setIsSending(true);
    const [, err] = await SendMessageAction(conversationId, body.trim());
    setIsSending(false);
    if (!err) {
      setBody("");
      await loadThread(conversationId);
    } else {
      setError(err);
    }
  };

  // Only show a timestamp on the last message of a consecutive run from the
  // same sender, so the thread reads like a modern chat instead of a label
  // under every single bubble.
  const isLastInRun = (index: number) => index === messages.length - 1 || messages[index + 1].sender !== messages[index].sender;

  return (
    <div className="flex flex-col h-[calc(100vh-9rem)] bg-white shadow rounded-lg overflow-hidden">
      <div className="flex items-center gap-3 p-4 border-b">
        <div className="size-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <ShieldCheck className="size-5" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900 leading-tight">Admin Support</h2>
          <p className="text-xs text-gray-400">Platform administration team</p>
        </div>
      </div>

      {error && <p className="text-sm text-red-500 px-4 pt-2">{error}</p>}

      {isLoading ? (
        <p className="text-sm text-gray-500 p-4">Loading...</p>
      ) : !conversationId ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-500">
          <MessagesSquare className="size-8 text-gray-300" />
          <p className="text-sm">You haven&apos;t contacted admin yet.</p>
          <button
            onClick={handleStart}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
          >
            Start a conversation
          </button>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
            {messages.length === 0 ? (
              <p className="text-sm text-gray-400">No messages yet - say hello.</p>
            ) : (
              messages.map((m, i) => {
                const isMine = m.sender === user?.id;
                const showMeta = isLastInRun(i);
                return (
                  <div key={m.id} className={`max-w-md ${isMine ? "ml-auto" : ""}`}>
                    <div className={`p-3 rounded-2xl text-sm ${isMine ? "bg-blue-600 text-white rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm"}`}>
                      {m.body}
                    </div>
                    {showMeta && (
                      <p className={`text-[11px] mt-1 text-gray-400 ${isMine ? "text-right" : ""}`}>
                        {new Date(m.createdAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>
          <div className="flex gap-2 p-4 border-t">
            <input
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message to admin..."
              className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={handleSend}
              disabled={!body.trim() || isSending}
              className="bg-blue-600 text-white size-10 shrink-0 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center"
              aria-label="Send message"
            >
              <Send className="size-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
