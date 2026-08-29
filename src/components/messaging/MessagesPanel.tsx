"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Users } from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  GetConversationsAction,
  GetMessagesAction,
  GetMyContactsAction,
  SendMessageAction,
  StartConversationWithAction,
  MarkConversationReadAction,
} from "@/server/message";
import { Conversation, ConversationParticipant, Message } from "@/types/message";
import { useMessagingSocket } from "@/hooks/use-messaging-socket";
import { MessageStatusTicks } from "@/components/messaging/MessageStatusTicks";
import { PresenceDot } from "@/components/messaging/PresenceDot";

const ROLE_LABELS: Record<string, string> = {
  STUDENT: "Student",
  PARENT: "Parent",
  TUTOR: "Tutor",
  HOD: "HOD",
  STC_ADMIN: "STC Admin",
  TUTOR_ADMIN: "Tutor Admin",
  SUPER_ADMIN: "Super Admin",
  ALMIGHTY_ADMIN: "Super Admin",
};

interface ContactRow {
  contact: ConversationParticipant;
  conversationId: string | null;
  lastMessageAt: string | null;
}

function otherParticipant(conversation: Conversation, myId: string): ConversationParticipant | undefined {
  return conversation.participants.find(
    (p): p is ConversationParticipant => typeof p !== "string" && p.id !== myId
  );
}

// Chat-app-style contact list + thread, replacing the old single
// admin-support-only thread. The resolved contact list (who this person can
// actually message) is entirely server-side - see stcbe's
// MessageService.getMyContacts - so this component just renders whatever
// comes back, whether that's one admin or several (e.g. both a TUTOR_ADMIN
// and an STC_ADMIN assigned to the same student), plus any tutor<->parent/
// student pair a super admin has explicitly granted direct access to.
export default function MessagesPanel({ initialConversationId }: { initialConversationId?: string | null }) {
  const { user } = useUser();
  const [rows, setRows] = useState<ContactRow[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const appliedInitialConversationId = useRef(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [isLoadingThread, setIsLoadingThread] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const conversationIdRef = useRef<string | null>(null);
  conversationIdRef.current = conversationId;

  const { joinConversation, leaveConversation } = useMessagingSocket({
    onMessageNew: (message) => {
      if (message.conversation !== conversationIdRef.current) {
        // Not the open thread - just refresh the contact list so unread
        // ordering/timestamps stay current.
        loadContacts();
        return;
      }
      setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
    },
    onMessageDelivered: ({ conversationId: cid, userId }) => {
      if (cid !== conversationIdRef.current) return;
      const now = new Date().toISOString();
      setMessages((prev) => prev.map((m) => ({ ...m, deliveredTo: { ...m.deliveredTo, [userId]: now } })));
    },
    onMessageRead: ({ conversationId: cid, userId }) => {
      if (cid !== conversationIdRef.current) return;
      const now = new Date().toISOString();
      setMessages((prev) => prev.map((m) => ({ ...m, readReceipts: { ...m.readReceipts, [userId]: now } })));
    },
    // Android backgrounds the WebView and drops the socket, so a reconnect
    // (e.g. app resumed from the background) may have missed events -
    // refetch whatever's on screen to close that gap.
    onReconnect: () => {
      loadContacts();
      if (conversationIdRef.current) {
        GetMessagesAction(conversationIdRef.current).then(([res]) => setMessages(res?.data ?? []));
      }
    },
  });

  const loadContacts = async () => {
    setIsLoadingContacts(true);
    const [contactsRes] = await GetMyContactsAction();
    const [conversationsRes] = await GetConversationsAction();
    const contacts = contactsRes?.data ?? [];
    const conversations = conversationsRes?.data ?? [];

    const merged: ContactRow[] = contacts.map((contact) => {
      const match = user
        ? conversations.find((c) => otherParticipant(c, user.id)?.id === contact.id)
        : undefined;
      return { contact, conversationId: match?.id ?? null, lastMessageAt: match?.lastMessageAt ?? null };
    });

    merged.sort((a, b) => {
      if (a.lastMessageAt && b.lastMessageAt) return b.lastMessageAt.localeCompare(a.lastMessageAt);
      if (a.lastMessageAt) return -1;
      if (b.lastMessageAt) return 1;
      return `${a.contact.firstName} ${a.contact.lastName}`.localeCompare(`${b.contact.firstName} ${b.contact.lastName}`);
    });

    setRows(merged);
    setIsLoadingContacts(false);
  };

  useEffect(() => {
    loadContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Deep-link from a notification (e.g. "New message") straight into the
  // conversation it's about, instead of leaving the user on the bare list.
  useEffect(() => {
    if (!initialConversationId || appliedInitialConversationId.current || isLoadingContacts) return;
    const row = rows.find((r) => r.conversationId === initialConversationId);
    if (row) {
      appliedInitialConversationId.current = true;
      openContact(row);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialConversationId, isLoadingContacts, rows]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Keep the socket room membership in sync with whichever thread is open,
  // so message:new/delivered/read only ever arrive for the visible thread.
  useEffect(() => {
    if (!conversationId) return;
    joinConversation(conversationId);
    return () => leaveConversation(conversationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  const openContact = async (row: ContactRow) => {
    setSelectedContactId(row.contact.id);
    setError(null);
    setIsLoadingThread(true);

    let id = row.conversationId;
    if (!id) {
      const [res, err] = await StartConversationWithAction(row.contact.id);
      if (err || !res?.data) {
        setIsLoadingThread(false);
        setError(err || "Could not start conversation");
        return;
      }
      id = res.data.id;
    }

    setConversationId(id);
    const [msgRes] = await GetMessagesAction(id);
    setMessages(msgRes?.data ?? []);
    await MarkConversationReadAction(id);
    setIsLoadingThread(false);
    loadContacts();
  };

  const handleSend = async () => {
    if (!conversationId || !body.trim() || isSending) return;
    setIsSending(true);
    const [, err] = await SendMessageAction(conversationId, body.trim());
    setIsSending(false);
    if (err) {
      setError(err);
      return;
    }
    setBody("");
    const [res] = await GetMessagesAction(conversationId);
    setMessages(res?.data ?? []);
    loadContacts();
  };

  const selectedContact = rows.find((r) => r.contact.id === selectedContactId)?.contact;

  return (
    <div className="flex h-[calc(100vh-9rem)] bg-white shadow rounded-lg overflow-hidden">
      {/* Contact list */}
      <div className="w-full sm:w-80 border-r flex flex-col shrink-0">
        <div className="flex items-center gap-2 p-4 border-b">
          <Users className="size-5 text-blue-600" />
          <h2 className="font-semibold text-gray-900">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoadingContacts ? (
            <p className="text-sm text-gray-500 p-4">Loading...</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-gray-500 p-4">No one to message yet.</p>
          ) : (
            rows.map((row) => (
              <button
                key={row.contact.id}
                onClick={() => openContact(row)}
                className={`w-full flex items-center gap-3 p-3 text-left hover:bg-blue-50 border-b transition ${
                  selectedContactId === row.contact.id ? "bg-blue-100" : ""
                }`}
              >
                <div className="relative shrink-0">
                  <Avatar className="size-9">
                    <AvatarImage src={row.contact.avatarUrl} alt={row.contact.firstName} />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {row.contact.firstName?.[0]}
                      {row.contact.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <PresenceDot online={row.contact.online} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate text-gray-900">
                    {row.contact.firstName} {row.contact.lastName}
                  </p>
                  <span className="text-[11px] bg-gray-100 text-gray-600 rounded-full px-1.5 py-0.5">
                    {ROLE_LABELS[row.contact.role] ?? row.contact.role}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Thread */}
      <div className="flex-1 flex flex-col min-w-0">
        {!selectedContact ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Select someone to start chatting
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 p-4 border-b">
              <div className="relative shrink-0">
                <Avatar className="size-9">
                  <AvatarImage src={selectedContact.avatarUrl} alt={selectedContact.firstName} />
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {selectedContact.firstName?.[0]}
                    {selectedContact.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <PresenceDot online={selectedContact.online} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 leading-tight">
                  {selectedContact.firstName} {selectedContact.lastName}
                </h3>
                <p className="text-xs text-gray-400">
                  {selectedContact.online ? "Online" : ROLE_LABELS[selectedContact.role] ?? selectedContact.role}
                </p>
              </div>
            </div>

            {error && <p className="text-sm text-red-500 px-4 pt-2">{error}</p>}

            {isLoadingThread ? (
              <div className="flex-1 flex items-center justify-center text-sm text-gray-500">Loading...</div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
                {messages.length === 0 ? (
                  <p className="text-sm text-gray-400">No messages yet - say hello.</p>
                ) : (
                  messages.map((m) => {
                    const isMine = m.sender === user?.id;
                    return (
                      <div key={m.id} className={`max-w-md ${isMine ? "ml-auto" : ""}`}>
                        <div
                          className={`p-3 rounded-2xl text-sm ${
                            isMine ? "bg-blue-600 text-white rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm"
                          }`}
                        >
                          {m.body}
                        </div>
                        <p className={`flex items-center gap-1 text-[11px] mt-1 text-gray-400 ${isMine ? "justify-end" : ""}`}>
                          {new Date(m.createdAt).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {isMine && <MessageStatusTicks message={m} otherParticipantIds={[selectedContact.id]} />}
                        </p>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>
            )}

            <div className="flex gap-2 p-4 border-t">
              <input
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={`Message ${selectedContact.firstName}...`}
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
    </div>
  );
}
