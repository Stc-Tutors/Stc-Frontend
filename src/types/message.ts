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
