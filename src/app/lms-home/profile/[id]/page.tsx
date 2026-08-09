"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ViewProfile from "@/components/profile/ViewProfile";

export default function UserProfileByIdPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  return (
    <section className="bg-gray-100 min-h-screen p-6">
      <button
        onClick={() => router.back()}
        className="flex items-center text-gray-700 mb-4 hover:text-blue-500"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        <span className="text-sm font-bold">BACK</span>
      </button>

      <ViewProfile userId={id} />
    </section>
  );
}
