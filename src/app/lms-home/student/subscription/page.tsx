"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import PlansPanel from "@/components/subscription/PlansPanel";

export default function StudentSubscriptionPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-4">
      <button
        onClick={() => router.push("/lms-home/student/dashboard")}
        className="flex items-center text-gray-700 mb-4 hover:text-blue-500"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        <span className="text-sm font-bold">BACK</span>
      </button>

      <h1 className="text-2xl font-semibold text-gray-900 mb-1">Plans &amp; Subscription</h1>
      <p className="text-gray-500 text-sm mb-6">Manage your billing plan.</p>

      <PlansPanel />
    </div>
  );
}
