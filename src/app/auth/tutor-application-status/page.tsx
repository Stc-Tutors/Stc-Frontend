import Link from "next/link";
import { MoveLeft } from "lucide-react";
import TutorApplicationStatusView from "@/components/tutor-application-status";

// Applicant-facing status check + support messaging, reached after
// submitting the tutor registration wizard. The applicant can't log in
// normally until APPROVED (see auth.service.ts), so this is backed by a
// separate status token, not a session - see tutor-application-context.tsx.
export default function TutorApplicationStatusPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="p-6">
        <Link
          href="/"
          className="text-[#3b5bdb] underline underline-offset-4 hover:text-[#38b6ff] transition-colors duration-200 flex items-center"
        >
          <MoveLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </div>
      <div className="flex-1 px-6 pb-12">
        <TutorApplicationStatusView />
      </div>
    </div>
  );
}
