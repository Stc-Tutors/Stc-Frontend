"use client";

import { ClassReportsAdmin } from "@/components/class-reports/class-reports-admin";

export default function AdminClassReportsPage() {
  return (
    <div className="bg-white shadow rounded-2xl p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Class Reports</h1>
        <p className="text-sm text-gray-500">The after-class report each tutor files, and which ones are still missing.</p>
      </div>
      <ClassReportsAdmin />
    </div>
  );
}
