import Link from "next/link";
import { ShieldAlert } from "lucide-react";

// Shown in place of an admin page the signed-in person hasn't been granted. The sidebar already hides
// these pages, but nothing stopped someone opening one by URL, and each page then reacted differently -
// a working-looking form that fails on save, a crash, or a misleading empty list. One clear message instead.
export default function AccessNotice({ pageLabel, superAdminOnly }: { pageLabel: string; superAdminOnly: boolean }) {
  return (
    <div role="alert" className="mx-auto max-w-lg rounded-lg border border-amber-200 bg-amber-50 p-6 text-center space-y-3">
      <ShieldAlert className="mx-auto h-8 w-8 text-amber-600" aria-hidden="true" />
      <h1 className="text-lg font-semibold text-gray-900">You don&apos;t have access to {pageLabel}</h1>
      <p className="text-sm text-gray-700">
        {superAdminOnly
          ? "Only a Super Admin can open this page."
          : "Your account hasn't been given permission for this page yet. Ask a Super Admin to grant it."}
      </p>
      <Link
        href="/lms-home/admin/dashboard"
        className="inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
