"use client";

import { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GetLinkedStudentsAction } from "@/server/enrollment";
import { GetStudentCoursesAction } from "@/server/course-enrollment";
import { GetTutorProfileAction } from "@/server/tutor-profile";
import { GetMySubjectEnrollmentsAction } from "@/server/subject-enrollment";
import { GetMyTutorChangeRequestsAction, SubmitTutorChangeRequestAction } from "@/server/tutor-change-request";
import { ToastError, ToastSuccess } from "@/components/ui/custom/toast";
import { Course } from "@/types/course";
import { TutorProfile, TutorSummary } from "@/types/tutor-profile";
import { SERVICE_TYPE_LABELS } from "@/constants/taxonomy";

// One specific thing this tutor teaches this parent's family - a child in
// two courses with the same tutor gets two of these, not one vague "also
// teaches X" line. subjectEnrollmentId is best-effort (matched by student +
// subject name against GetMySubjectEnrollmentsAction) - undefined for a
// course whose subject name doesn't line up with any SubjectEnrollment
// (e.g. some Course-Module services), in which case "Request tutor change"
// simply isn't offered for that one row rather than guessing wrong.
interface TeachingAssignment {
  studentId: string;
  childName: string;
  courseTitle: string;
  serviceType: string;
  subjectEnrollmentId?: string;
  hasPendingChangeRequest?: boolean;
}

interface TutorRow {
  tutorId: string;
  name: string;
  avatarUrl?: string;
  profile: TutorProfile;
  assignments: TeachingAssignment[];
}

function tutorName(tutor: TutorProfile["tutor"]): string {
  if (typeof tutor === "string") return "Tutor";
  return `${tutor.firstName} ${tutor.lastName}`;
}

// Every child's assigned tutor(s), resolved via their course enrollments
// (Course.tutor is the real assignment link - see stcbe's
// CourseEnrollmentService/CourseAccessService) rather than anything on the
// Student record itself. GetTutorProfileAction is the same endpoint the
// tutor's own profile pages already use - already open to any authenticated
// role, just never wired into a parent-facing page before now.
export default function ParentTutorsPage() {
  const [rows, setRows] = useState<TutorRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [requestingFor, setRequestingFor] = useState<TeachingAssignment | null>(null);
  const [reason, setReason] = useState("");
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  const load = async () => {
    const [childrenRes] = await GetLinkedStudentsAction();
    const children = childrenRes?.data ?? [];

    // Fetched once up front, then matched per assignment below (by student
    // + subject name), rather than one lookup per row.
    const [subjectEnrollmentsRes] = await GetMySubjectEnrollmentsAction();
    const subjectEnrollments = subjectEnrollmentsRes?.data ?? [];
    const [myRequestsRes] = await GetMyTutorChangeRequestsAction();
    const pendingSubjectEnrollmentIds = new Set(
      (myRequestsRes?.data ?? []).filter((r) => r.status === "PENDING").map((r) => r.subjectEnrollment)
    );

    const byTutor = new Map<string, TutorRow>();

    for (const child of children) {
      const [enrollmentsRes] = await GetStudentCoursesAction(child.id);
      const courses = (enrollmentsRes?.data ?? [])
        .map((e) => (typeof e.course === "string" ? null : e.course))
        .filter((c): c is Course => !!c);

      // Per course, not per tutor - the same tutor can teach this child
      // more than one subject/service, and each is its own assignment
      // line rather than being collapsed into one vague "also teaches X".
      for (const course of courses) {
        const tutorId = typeof course.tutor === "string" ? course.tutor : course.tutor?.id;
        if (!tutorId) continue;

        const matchingSubjectEnrollment = subjectEnrollments.find(
          (se) => se.student === child.id && se.subject === course.title
        );

        const assignment: TeachingAssignment = {
          studentId: child.id,
          childName: child.fullName,
          courseTitle: course.title,
          serviceType: course.serviceType,
          subjectEnrollmentId: matchingSubjectEnrollment?.id,
          hasPendingChangeRequest: matchingSubjectEnrollment
            ? pendingSubjectEnrollmentIds.has(matchingSubjectEnrollment.id)
            : false,
        };

        const existingRow = byTutor.get(tutorId);
        if (existingRow) {
          existingRow.assignments.push(assignment);
          continue;
        }
        const [profileRes] = await GetTutorProfileAction(tutorId);
        if (!profileRes?.data) continue;
        const t = profileRes.data.tutor;
        byTutor.set(tutorId, {
          tutorId,
          name: tutorName(t),
          avatarUrl: typeof t === "string" ? undefined : t.avatarUrl,
          profile: profileRes.data,
          assignments: [assignment],
        });
      }
    }

    setRows(Array.from(byTutor.values()));
    setIsLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmitRequest = async () => {
    if (!requestingFor?.subjectEnrollmentId) return;
    if (reason.trim().length < 10) {
      ToastError("Please provide a genuine reason (at least 10 characters)");
      return;
    }
    setIsSubmittingRequest(true);
    const [, error] = await SubmitTutorChangeRequestAction(requestingFor.subjectEnrollmentId, reason.trim());
    setIsSubmittingRequest(false);
    if (error) {
      ToastError(error);
      return;
    }
    ToastSuccess("Your tutor change request has been submitted for review");
    setRequestingFor(null);
    setReason("");
    setIsLoading(true);
    load();
  };

  if (isLoading) return <p className="p-6 text-sm text-gray-500">Loading...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Your Children&apos;s Tutors</h1>
        <p className="text-gray-500 text-sm mt-1">Background and qualifications for everyone currently teaching your children.</p>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
          <GraduationCap className="w-10 h-10 mx-auto text-gray-400 mb-3" />
          No tutors assigned yet - this fills in once a child is enrolled in a course with a tutor.
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
                <div>
                  <h2 className="font-semibold text-gray-900">{row.name}</h2>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <span className="font-medium">Teaching your family:</span>
                <ul className="space-y-1 mt-1">
                  {row.assignments.map((a, i) => (
                    <li key={i} className="flex items-center justify-between gap-2">
                      <span>
                        <span className="text-gray-900">{a.childName}</span> — {a.courseTitle}
                        <span className="text-gray-500">
                          {" "}
                          ({SERVICE_TYPE_LABELS[a.serviceType] ?? a.serviceType})
                        </span>
                      </span>
                      {a.subjectEnrollmentId &&
                        (a.hasPendingChangeRequest ? (
                          <span className="text-xs text-amber-600 whitespace-nowrap">Change requested</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setRequestingFor(a)}
                            className="text-xs font-medium text-blue-600 hover:underline whitespace-nowrap"
                          >
                            Request change
                          </button>
                        ))}
                    </li>
                  ))}
                </ul>
              </div>

              {row.profile.bio && (
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Bio:</span> {row.profile.bio}
                </div>
              )}

              {row.profile.teachingCombinations?.length > 0 && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Can teach:</span>
                  <ul className="list-disc list-inside">
                    {row.profile.teachingCombinations.map((tc, i) => (
                      <li key={i}>
                        {tc.subjectsTaught.join(", ")}
                        {tc.curriculum ? ` (${[tc.curriculum, tc.gradeLevel].filter(Boolean).join(" - ")})` : ""}
                        {tc.country ? ` · ${tc.country}` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {row.profile.ageLevelsTaught && row.profile.ageLevelsTaught.length > 0 && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Age groups taught:</span> {row.profile.ageLevelsTaught.join(", ")}
                </p>
              )}

              {[
                ["Digital skills", row.profile.digitalSkillsBundles],
                ["Music instruments", row.profile.musicInstruments],
                ["Soft skills topics", row.profile.softSkillsTopics],
                ["Career coaching topics", row.profile.careerCoachingTopics],
                ["Self-development topics", row.profile.selfDevTopics],
                ["Adult education focus areas", row.profile.adultEdFocusAreas],
              ]
                .filter(([, list]) => Array.isArray(list) && list.length > 0)
                .map(([label, list]) => (
                  <p key={`can-teach-${label}`} className="text-sm text-gray-600">
                    <span className="font-medium">{label}:</span> {(list as string[]).join(", ")}
                  </p>
                ))}

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

              {row.profile.highestQualification && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Highest qualification:</span> {row.profile.highestQualification}
                </p>
              )}

              {row.profile.otherQualificationsHeld && row.profile.otherQualificationsHeld.length > 0 && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Other qualifications:</span>{" "}
                  {row.profile.otherQualificationsHeld.join(", ")}
                </p>
              )}

              {row.profile.yearsOnlineTutoringExperience != null && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Online tutoring experience:</span>{" "}
                  {row.profile.yearsOnlineTutoringExperience} years
                </p>
              )}

              {row.profile.previousPlatforms && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Previously taught on:</span> {row.profile.previousPlatforms}
                </p>
              )}

              {row.profile.teachingExperienceHistory && row.profile.teachingExperienceHistory.length > 0 && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Teaching history:</span>
                  <ul className="list-disc list-inside">
                    {row.profile.teachingExperienceHistory.map((entry, i) => (
                      <li key={i}>
                        {entry.role} at {entry.institution} ({entry.startDate}
                        {" - "}
                        {entry.currentlyWorkHere ? "present" : entry.endDate ?? ""})
                        {entry.description ? ` - ${entry.description}` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {row.profile.preferredClassFormat && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Preferred class format:</span>{" "}
                  {row.profile.preferredClassFormat.replace(/[-_]/g, " ")}
                </p>
              )}

              {row.profile.maxWeeklyHours && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Max weekly hours:</span> {row.profile.maxWeeklyHours.replace(/[-_]/g, " ")}
                </p>
              )}

              {row.profile.availability && row.profile.availability.length > 0 && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">General availability:</span>
                  <ul className="list-disc list-inside">
                    {row.profile.availability.map((slot, i) => (
                      <li key={i}>
                        {slot.dayOfWeek}: {slot.startTime} - {slot.endTime}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!requestingFor} onOpenChange={(open) => !open && setRequestingFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request a tutor change</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            For {requestingFor?.childName}&apos;s {requestingFor?.courseTitle} - an admin reviews every request, so
            please explain why (schedule mismatch, teaching style, a specific concern, etc).
          </p>
          <Textarea
            placeholder="Please share a genuine reason for wanting to switch tutors..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestingFor(null)} disabled={isSubmittingRequest}>
              Cancel
            </Button>
            <Button onClick={handleSubmitRequest} disabled={isSubmittingRequest}>
              {isSubmittingRequest ? "Submitting..." : "Submit request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
