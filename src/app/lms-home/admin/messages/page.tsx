"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MessagesSquare } from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GetConversationsAction, GetMessagesAction, SendMessageAction, MarkConversationReadAction } from "@/server/message";
import { Conversation, ConversationParticipant, Message } from "@/types/message";
import { useMessagingSocket } from "@/hooks/use-messaging-socket";
import { MessageStatusTicks } from "@/components/messaging/MessageStatusTicks";
import { PresenceDot } from "@/components/messaging/PresenceDot";

function otherParticipants(conversation: Conversation, myId: string): ConversationParticipant[] {
  return conversation.participants.filter(
    (p): p is ConversationParticipant => typeof p !== "string" && p.id !== myId
  );
}

// Short label for a chat participant's role badge.
const ROLE_LABELS: Record<string, string> = {
  STUDENT: "Student",
  PARENT: "Parent",
  TUTOR: "Tutor",
  HOD: "HOD",
  STC_ADMIN: "Admin",
  TUTOR_ADMIN: "Admin",
  SUPER_ADMIN: "Super Admin",
  ALMIGHTY_ADMIN: "Super Admin",
};

// Deep-links to the user's admin profile detail page so an admin reading a
// thread has instant context on who they're talking to.
function ParticipantLink({ participant }: { participant: ConversationParticipant }) {
  return (
    <a
      href={`/lms-home/admin/users/${participant.id}`}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="hover:underline"
    >
      {participant.firstName} {participant.lastName}{" "}
      <span className="text-[10px] bg-gray-100 text-gray-600 rounded-full px-1.5 py-0.5">
        {ROLE_LABELS[participant.role] ?? participant.role}
      </span>
    </a>
  );
}

export default function AdminMessagesPage() {
  return (
    <Suspense fallback={<div className="flex h-[calc(100vh-4rem)] bg-white shadow rounded-lg" />}>
      <AdminMessagesPageInner />
    </Suspense>
  );
}

function AdminMessagesPageInner() {
  const { user } = useUser();
  const initialConversationId = useSearchParams().get("conversationId");
  // Tracks the last conversationId this effect already applied - not just a
  // one-shot boolean, so a second notification (a different conversation, or
  // even the same one after navigating away and back) is re-applied instead
  // of silently doing nothing once this page is already mounted.
  const appliedInitialConversationId = useRef<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const selectedIdRef = useRef<string | null>(null);
  selectedIdRef.current = selectedId;

  const { joinConversation, leaveConversation } = useMessagingSocket({
    onMessageNew: (message) => {
      if (message.conversation !== selectedIdRef.current) {
        loadConversations();
        return;
      }
      setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
    },
    onMessageDelivered: ({ conversationId, userId }) => {
      if (conversationId !== selectedIdRef.current) return;
      const now = new Date().toISOString();
      setMessages((prev) => prev.map((m) => ({ ...m, deliveredTo: { ...m.deliveredTo, [userId]: now } })));
    },
    onMessageRead: ({ conversationId, userId }) => {
      if (conversationId !== selectedIdRef.current) return;
      const now = new Date().toISOString();
      setMessages((prev) => prev.map((m) => ({ ...m, readReceipts: { ...m.readReceipts, [userId]: now } })));
    },
    // Android backgrounds the WebView and drops the socket, so a reconnect
    // (e.g. app resumed from the background) may have missed events -
    // refetch whatever's on screen to close that gap.
    onReconnect: () => {
      loadConversations();
      if (selectedIdRef.current) {
        GetMessagesAction(selectedIdRef.current).then(([res]) => setMessages(res?.data ?? []));
      }
    },
  });

  const loadConversations = async () => {
    const [res] = await GetConversationsAction();
    setConversations(res?.data ?? []);
    setIsLoading(false);
  };

  useEffect(() => {
    loadConversations();
  }, []);

  // Deep-link from a notification (e.g. "New message") straight into the
  // conversation it's about, instead of leaving the admin on the bare inbox.
  useEffect(() => {
    if (!initialConversationId || appliedInitialConversationId.current === initialConversationId || isLoading) return;
    if (conversations.some((c) => c.id === initialConversationId)) {
      appliedInitialConversationId.current = initialConversationId;
      openConversation(initialConversationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialConversationId, isLoading, conversations]);

  useEffect(() => {
    if (!selectedId) return;
    joinConversation(selectedId);
    return () => leaveConversation(selectedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const openConversation = async (id: string) => {
    setSelectedId(id);
    const [res] = await GetMessagesAction(id);
    setMessages(res?.data ?? []);
    await MarkConversationReadAction(id);
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c)));
    loadConversations();
  };

  const handleSend = async () => {
    if (!selectedId || !body.trim() || !canReplyToActive) return;
    const [, error] = await SendMessageAction(selectedId, body);
    if (!error) {
      setBody("");
      const [res] = await GetMessagesAction(selectedId);
      setMessages(res?.data ?? []);
    }
  };

  const activeConversation = conversations.find((c) => c.id === selectedId);
  const activeOthers = user && activeConversation ? otherParticipants(activeConversation, user.id) : [];
  // Defaults to false (can't reply) until the conversation's own data has
  // loaded. In practice always true here (this page has no oversight/"show
  // all" mode - every conversation shown is one the caller is a real
  // participant of), kept for defensive consistency with the SuperAdmin
  // Communications page, which does have that mode.
  const canReplyToActive = activeConversation?.canReply ?? false;

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white shadow rounded-lg overflow-hidden">
      <div className="w-1/3 border-r flex flex-col">
        <div className="flex items-center gap-2 p-4 border-b">
          <MessagesSquare className="text-blue-500" />
          <h2 className="font-bold text-lg">Support Inbox</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <p className="text-sm text-gray-500 p-4">Loading...</p>
          ) : conversations.length === 0 ? (
            <p className="text-sm text-gray-500 p-4">No conversations yet.</p>
          ) : (
            conversations.map((c) => {
              const others = user ? otherParticipants(c, user.id) : [];
              const primary = others[0];
              const hasUnread = (c.unreadCount ?? 0) > 0 && c.id !== selectedId;
              return (
                <div
                  key={c.id}
                  onClick={() => openConversation(c.id)}
                  className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-blue-50 border-b ${
                    selectedId === c.id ? "bg-blue-100" : hasUnread ? "bg-blue-50/60" : ""
                  }`}
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={primary?.avatarUrl} alt={primary?.firstName} />
                      <AvatarFallback>{primary?.firstName?.[0] ?? "?"}</AvatarFallback>
                    </Avatar>
                    <PresenceDot online={primary?.online} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm truncate ${hasUnread ? "font-semibold text-gray-900" : "font-medium"}`}>
                      {c.isSupportThread && <span className="text-xs text-gray-500">Support · </span>}
                      {others.length > 0 ? (
                        others.map((o, i) => (
                          <span key={o.id}>
                            <ParticipantLink participant={o} />
                            {i < others.length - 1 && ", "}
                          </span>
                        ))
                      ) : (
                        "Conversation"
                      )}
                    </p>
                    <p className="text-xs text-gray-500">{new Date(c.lastMessageAt).toLocaleString()}</p>
                  </div>
                  {hasUnread && (
                    <span className="shrink-0 bg-red-500 text-white text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                      {c.unreadCount! > 9 ? "9+" : c.unreadCount}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-col">
        {!selectedId ? (
          <div className="flex h-full items-center justify-center text-gray-400">Select a conversation</div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-3 mb-4">
              {messages.map((m) => {
                const isMine = m.sender === user?.id;
                return (
                  <div
                    key={m.id}
                    className={`max-w-md p-3 rounded-lg text-sm ${
                      isMine ? "bg-blue-500 text-white ml-auto" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {m.body}
                    <p
                      className={`flex items-center gap-1 text-xs mt-1 ${
                        isMine ? "text-blue-100 justify-end" : "text-gray-400"
                      }`}
                    >
                      {new Date(m.createdAt).toLocaleTimeString()}
                      {isMine && (
                        <MessageStatusTicks message={m} otherParticipantIds={activeOthers.map((o) => o.id)} />
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
            {!canReplyToActive && (
              <p className="text-xs text-amber-700 bg-amber-50 rounded-md px-3 py-2 mb-2">
                You&apos;re viewing this conversation for monitoring - only its actual participants can reply.
              </p>
            )}
            <div className="flex gap-2">
              <input
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                disabled={!canReplyToActive}
                placeholder="Reply..."
                className="flex-1 border rounded-md px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-400"
              />
              <button
                onClick={handleSend}
                disabled={!canReplyToActive}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm disabled:opacity-50 disabled:pointer-events-none"
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
