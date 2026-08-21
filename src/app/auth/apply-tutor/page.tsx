import Link from "next/link";
import { Suspense } from "react";
import { MoveLeft } from "lucide-react";
import { TutorApplicationProvider } from "@/contexts/tutor-application-context";
import TutorApplicationFlow from "@/components/tutor-application-flow";
import Loader from "@/components/loading";

// Multi-step tutor registration wizard - see tutor-registration-schema.json.
// Supersedes the old single-page ApplyTutorForm (its route/backend endpoint
// are kept but no longer linked from anywhere in the app). Also doubles as
// the "edit my flagged application" flow (?editStep=N) - see
// tutor-application-flow.tsx - hence the Suspense boundary useSearchParams() needs.
export default function ApplyTutorPage() {
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
      <Suspense fallback={<Loader />}>
        <TutorApplicationProvider>
          <TutorApplicationFlow />
        </TutorApplicationProvider>
      </Suspense>
    </div>
  );
}
