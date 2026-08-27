"use client";

import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import MessagesPanel from "@/components/messaging/MessagesPanel";

export default function TutorMessagesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 px-6 py-4" />}>
      <TutorMessagesPageInner />
    </Suspense>
  );
}

function TutorMessagesPageInner() {
  const router = useRouter();
  const conversationId = useSearchParams().get("conversationId");

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-4">
      <button
        onClick={() => router.push("/lms-home/tutor/dashboard")}
        className="flex items-center text-gray-700 mb-4 hover:text-blue-500"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        <span className="text-sm font-bold">BACK</span>
      </button>

      <MessagesPanel initialConversationId={conversationId} />
    </div>
  );
}
