"use client";

import { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GetEnrollmentsAction } from "@/server/enrollment";
import { GetStudentCoursesAction } from "@/server/course-enrollment";
import { GetTutorProfileAction } from "@/server/tutor-profile";
import { Course } from "@/types/course";
import { TutorProfile } from "@/types/tutor-profile";

interface TutorRow {
  tutorId: string;
  name: string;
  avatarUrl?: string;
  profile: TutorProfile;
}

function tutorName(tutor: TutorProfile["tutor"]): string {
  if (typeof tutor === "string") return "Tutor";
  return `${tutor.firstName} ${tutor.lastName}`;
}

// Same resolution as the parent version (Course.tutor via this student's own
// course enrollments) - see lms-home/parent/tutors/page.tsx.
export default function StudentTutorsPage() {
  const [rows, setRows] = useState<TutorRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [enrollmentsRes] = await GetEnrollmentsAction();
      const studentId = enrollmentsRes?.data?.[0]?.id;
      if (!studentId) {
        setIsLoading(false);
        return;
      }

      const [courseEnrollmentsRes] = await GetStudentCoursesAction(studentId);
      const courses = (courseEnrollmentsRes?.data ?? [])
        .map((e) => (typeof e.course === "string" ? null : e.course))
        .filter((c): c is Course => !!c);

      const tutorIds = Array.from(
        new Set(courses.map((c) => (typeof c.tutor === "string" ? c.tutor : c.tutor?.id)).filter((id): id is string => !!id))
      );

      const results: TutorRow[] = [];
      for (const tutorId of tutorIds) {
        const [profileRes] = await GetTutorProfileAction(tutorId);
        if (!profileRes?.data) continue;
        const t = profileRes.data.tutor;
        results.push({
          tutorId,
          name: tutorName(t),
          avatarUrl: typeof t === "string" ? undefined : t.avatarUrl,
          profile: profileRes.data,
        });
      }

      setRows(results);
      setIsLoading(false);
    };
    load();
  }, []);

  if (isLoading) return <p className="p-6 text-sm text-gray-500">Loading...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Your Tutors</h1>
        <p className="text-gray-500 text-sm mt-1">Background and qualifications for everyone currently teaching you.</p>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
          <GraduationCap className="w-10 h-10 mx-auto text-gray-400 mb-3" />
          No tutors assigned yet - this fills in once you&apos;re enrolled in a course with a tutor.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map((row) => (
            <div key={row.tutorId} className="bg-white rounded-lg shadow-sm p-6 space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={row.avatarUrl} alt={row.name} />
                  <AvatarFallback className="bg-blue-100 text-blue-600">{row.name[0]}</AvatarFallback>
                </Avatar>
                <h2 className="font-semibold text-gray-900">{row.name}</h2>
              </div>

              {row.profile.bio && <p className="text-sm text-gray-700">{row.profile.bio}</p>}

              {row.profile.yearsOfExperience != null && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Experience:</span> {row.profile.yearsOfExperience} years
                </p>
              )}

              {row.profile.qualifications && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Qualifications:</span> {row.profile.qualifications}
                </p>
              )}

              {row.profile.education?.length > 0 && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Education:</span>
                  <ul className="list-disc list-inside">
                    {row.profile.education.map((e, i) => (
                      <li key={i}>
                        {e.degree}
                        {e.institution ? `, ${e.institution}` : ""}
                        {e.year ? ` (${e.year})` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {row.profile.otherCertifications && row.profile.otherCertifications.length > 0 && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Certifications:</span> {row.profile.otherCertifications.join(", ")}
                </p>
              )}

              {row.profile.preferredLanguages && row.profile.preferredLanguages.length > 0 && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Languages:</span> {row.profile.preferredLanguages.join(", ")}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
