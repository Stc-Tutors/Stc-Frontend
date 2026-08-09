"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import MessagesPanel from "@/components/messaging/MessagesPanel";

export default function TutorMessagesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-4">
      <button
        onClick={() => router.push("/lms-home/tutor/dashboard")}
        className="flex items-center text-gray-700 mb-4 hover:text-blue-500"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        <span className="text-sm font-bold">BACK</span>
      </button>

      <MessagesPanel />
    </div>
  );
}
