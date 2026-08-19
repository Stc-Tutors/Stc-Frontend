"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { Conversation, ConversationParticipant, Message } from "@/types/message";

export async function GetConversationsAction(): Promise<[ApiResponse<Conversation[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/conversations",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Conversation[]>) : null;
  return [resData, error];
}

// Admin/super-admin only - messaging an arbitrary specific user.
export async function StartConversationAction(
  participantIds: string[]
): Promise<[ApiResponse<Conversation> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/conversations",
    request: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantIds }),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Conversation>) : null;
  return [resData, error];
}

// Everyone else: the single "contact admin" thread. No recipient picker needed.
export async function StartSupportConversationAction(): Promise<[ApiResponse<Conversation> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/conversations/support",
    request: { method: "POST", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Conversation>) : null;
  return [resData, error];
}

// The resolved "who can I message" contact list for the logged-in user -
// for student/parent/tutor this is the admins actually covering them (which
// naturally includes more than one when e.g. both a TUTOR_ADMIN and an
// STC_ADMIN are assigned) plus anyone a super admin has explicitly granted
// direct tutor<->parent/student access to; for admin roles it's the
// tutors/students/parents within their existing management scope.
export async function GetMyContactsAction(): Promise<[ApiResponse<ConversationParticipant[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/conversations/my-contacts",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<ConversationParticipant[]>) : null;
  return [resData, error];
}

// Starts (or reuses) a 1:1 conversation with one specific contact - gated
// server-side to exactly the list GetMyContactsAction would return.
export async function StartConversationWithAction(
  userId: string
): Promise<[ApiResponse<Conversation> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/conversations/start-with/${userId}`,
    request: { method: "POST", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Conversation>) : null;
  return [resData, error];
}

export async function GetMessagesAction(
  conversationId: string
): Promise<[ApiResponse<Message[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/conversations/${conversationId}/messages`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Message[]>) : null;
  return [resData, error];
}

export async function SendMessageAction(
  conversationId: string,
  body: string
): Promise<[ApiResponse<Message> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/conversations/${conversationId}/messages`,
    request: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Message>) : null;
  return [resData, error];
}

export async function MarkConversationReadAction(conversationId: string): Promise<[ApiResponse<null> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/conversations/${conversationId}/read`,
    request: { method: "PATCH", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<null>) : null;
  return [resData, error];
}
