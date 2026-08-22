export interface ConversationParticipant {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  avatarUrl?: string;
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
  readBy: string[];
  createdAt: string;
}
