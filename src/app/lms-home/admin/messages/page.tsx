"use client";

import { useEffect, useState } from "react";
import { MessagesSquare } from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GetConversationsAction, GetMessagesAction, SendMessageAction, MarkConversationReadAction } from "@/server/message";
import { Conversation, ConversationParticipant, Message } from "@/types/message";

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
  const { user } = useUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadConversations = async () => {
    const [res] = await GetConversationsAction();
    setConversations(res?.data ?? []);
    setIsLoading(false);
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const openConversation = async (id: string) => {
    setSelectedId(id);
    const [res] = await GetMessagesAction(id);
    setMessages(res?.data ?? []);
    await MarkConversationReadAction(id);
    loadConversations();
  };

  const handleSend = async () => {
    if (!selectedId || !body.trim()) return;
    const [, error] = await SendMessageAction(selectedId, body);
    if (!error) {
      setBody("");
      const [res] = await GetMessagesAction(selectedId);
      setMessages(res?.data ?? []);
    }
  };

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
              return (
                <div
                  key={c.id}
                  onClick={() => openConversation(c.id)}
                  className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-blue-50 border-b ${
                    selectedId === c.id ? "bg-blue-100" : ""
                  }`}
                >
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarImage src={primary?.avatarUrl} alt={primary?.firstName} />
                    <AvatarFallback>{primary?.firstName?.[0] ?? "?"}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">
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
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-md p-3 rounded-lg text-sm ${
                    m.sender === user?.id ? "bg-blue-500 text-white ml-auto" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {m.body}
                  <p className={`text-xs mt-1 ${m.sender === user?.id ? "text-blue-100" : "text-gray-400"}`}>
                    {new Date(m.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Reply..."
                className="flex-1 border rounded-md px-3 py-2 text-sm"
              />
              <button onClick={handleSend} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
