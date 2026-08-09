"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { UserSearchSelect } from "@/components/user-search-select";
import { CourseForm } from "@/components/forms/course-form";
import { UserRole } from "@/types/user";

// Same CourseForm every course-creation entry point uses (the tutor's own,
// this one) - the only addition here is picking which tutor the course
// belongs to, since an admin creates it on their behalf rather than for
// themselves. When arriving from the Curriculum & Courses tab's
// "+ New course under X" link, serviceSlug/taxonomyNodeId/returnTo pin the
// form to that service/node and send the admin back to the workspace on
// success instead of the generic course detail page; absent those params
// (the generic admin entry point) the form behaves exactly as before, with
// the free Service dropdown shown.
export default function AdminCreateCoursePage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-gray-500">Loading...</p>}>
      <AdminCreateCoursePageInner />
    </Suspense>
  );
}

function AdminCreateCoursePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tutorId, setTutorId] = useState("");

  const serviceSlug = searchParams.get("serviceSlug") || undefined;
  const taxonomyNodeId = searchParams.get("taxonomyNodeId") || undefined;
  const returnTo = searchParams.get("returnTo") || undefined;

  return (
    <div className="p-6 bg-white shadow rounded-2xl max-w-2xl space-y-6">
      <h2 className="text-xl font-semibold">Create a Course</h2>
      <CourseForm
        tutorId={tutorId}
        canSubmit={!!tutorId}
        instructorPicker={
          <div className="space-y-1">
            <Label>Instructor *</Label>
            <UserSearchSelect role={UserRole.TUTOR} value={tutorId} onChange={setTutorId} placeholder="Search tutor by name or email" />
          </div>
        }
        lockedServiceSlug={serviceSlug}
        initialTaxonomyNodeId={taxonomyNodeId}
        returnTo={returnTo}
        onSuccess={(courseId) => router.push(`/lms-home/admin/courses/${courseId}`)}
      />
    </div>
  );
}
