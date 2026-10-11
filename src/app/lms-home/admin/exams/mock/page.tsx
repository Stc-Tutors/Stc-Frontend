"use client";

import MockCentre from "@/components/exams/MockCentre";
import { useUser } from "@/contexts/user-context";
import { isSuperOrAlmighty } from "@/lib/roles";

export default function AdminMockExamsPage() {
  const { user } = useUser();
  return (
    <div className="bg-white shadow rounded-2xl p-6">
      <MockCentre isSuper={!!user && isSuperOrAlmighty(user.role)} backHref="/lms-home/admin/exams" />
    </div>
  );
}
