"use client";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import NotificationList from "@/components/messaging/NotificationList";

export default function AdminNotificationPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen relative">
      <button
        onClick={() => router.push("/lms-home/admin/dashboard")}
        className="flex items-center text-gray-700 mb-4 hover:text-blue-500"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        <span className="text-sm font-bold">BACK</span>
      </button>

      <NotificationList />
    </div>
  );
}
