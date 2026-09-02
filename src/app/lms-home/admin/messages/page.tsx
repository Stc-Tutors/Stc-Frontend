"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import MessagesPanel from "@/components/messaging/MessagesPanel";

// HOD/STC_ADMIN/TUTOR_ADMIN/SUPER_ADMIN/ALMIGHTY_ADMIN (whoever ends up
// using Stc-Frontend's admin section rather than Stc-SuperAdmin) get the
// same contact-list + thread experience as every other role - this used to
// be a bespoke "existing conversations only" inbox with no way to start a
// new one, which meant an admin could never proactively message a tutor/
// student/parent assigned to them until that person messaged first (see
// stcbe's MessageService.getMyContacts for how their contact list is
// resolved: everyone within their AdminAssignment visibility scope, plus
// the staff directory).
export default function AdminMessagesPage() {
  return (
    <Suspense fallback={<div className="flex h-[calc(100vh-9rem)] bg-white shadow rounded-lg" />}>
      <AdminMessagesPageInner />
    </Suspense>
  );
}

function AdminMessagesPageInner() {
  const initialConversationId = useSearchParams().get("conversationId");
  return <MessagesPanel initialConversationId={initialConversationId} />;
}
