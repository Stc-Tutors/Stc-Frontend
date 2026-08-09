"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ProfileForm from "@/components/profile/ProfileForm";

export default function AdminProfilePage() {
  const router = useRouter();

  return (
    <section className="min-h-screen p-0">
      <button
        onClick={() => router.push("/lms-home/admin/dashboard")}
        className="flex items-center text-gray-700 mb-4 hover:text-blue-500"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        <span className="text-sm font-bold">BACK</span>
      </button>

      <ProfileForm />
    </section>
  );
}
