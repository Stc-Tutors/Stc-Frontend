export interface ConversationParticipant {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  avatarUrl?: string;
  // Live presence at the time the list was fetched - not pushed, so it's a
  // snapshot that goes stale until the next fetch/reconnect (see
  // useMessagingSocket and stcbe's MessageService.withOnline).
  online?: boolean;
}

export interface Conversation {
  id: string;
  participants: (ConversationParticipant | string)[];
  lastMessageAt: string;
  courseContext?: string;
  // A user's single thread with the admin team (see MessageService.
  // startSupportConversation) - e.g. a tutor messaging admin from the
  // post-submission application status page. Undistinguished from a regular
  // conversation without this flag.
  isSupportThread?: boolean;
}

export interface Message {
  id: string;
  conversation: string;
  sender: string;
  body: string;
  attachmentUrl?: string;
  // userId -> ISO timestamp. The sender is always present in both (see
  // stcbe's message.repository.ts). "Read" implies "delivered" but not
  // vice versa.
  deliveredTo: Record<string, string>;
  readReceipts: Record<string, string>;
  createdAt: string;
}
