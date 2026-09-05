"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Circle } from "rc-progress";
import { FcGlobe, FcBarChart } from "react-icons/fc";
import { IoMdContact, IoMdBook } from "react-icons/io";
import { GiUpgrade } from "react-icons/gi";
import { FaBirthdayCake, FaBullseye, FaHandsHelping } from "react-icons/fa";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GetEnrollmentAction } from "@/server/enrollment";
import { GetAcademicSummaryAction } from "@/server/admin";
import StudentGradingPanel from "@/components/tutorDashboard/StudentGradingPanel";
import GiveAssignmentPanel from "@/components/tutorDashboard/GiveAssignmentPanel";
import GiveResourcePanel from "@/components/tutorDashboard/GiveResourcePanel";
import { AcademicSummary, Student, studentAvatarUrl } from "@/types/student";

// Same ring pattern as the admin student-detail page's academic tab.
function RingStat({ label, percent }: { label: string; percent: number }) {
  return (
    <div className="border rounded-lg p-4 flex flex-col items-center gap-2">
      <div className="relative w-20 h-20">
        <Circle percent={percent} strokeWidth={8} trailWidth={8} strokeColor="#3b82f6" trailColor="#e5e7eb" />
        <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-800">
          {Math.round(percent)}%
        </div>
      </div>
      <p className="text-xs text-gray-500 text-center">{label}</p>
    </div>
  );
}

function calculateAge(dateOfBirth?: Date | string): number | null {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

export default function StudentProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [summary, setSummary] = useState<AcademicSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Bumped after giving an assignment so StudentGradingPanel (keyed on this)
  // remounts and refetches rather than showing a stale "no assignments yet".
  const [gradingRefreshKey, setGradingRefreshKey] = useState(0);

  useEffect(() => {
    const load = async () => {
      const [[res, err], [summaryRes]] = await Promise.all([
        GetEnrollmentAction(id as string),
        GetAcademicSummaryAction(id as string),
      ]);
      if (err || !res?.data) {
        setError(err || "Student not found");
      } else {
        setStudent(res.data);
      }
      setSummary(summaryRes?.data ?? null);
      setIsLoading(false);
    };
    load();
  }, [id]);

  if (isLoading) return <p className="p-6">Loading...</p>;
  if (error || !student) return <p className="p-6">{error || "Student not found"}</p>;

  return (
    <section className="bg-gray-100">
      <div className="bg-white flex justify-between py-12 px-24 ml-8 mr-9">
        <div className="flex gap-4 items-center">
          <Avatar className="h-16 w-16">
            <AvatarImage src={studentAvatarUrl(student.user)} alt={student.fullName} />
            <AvatarFallback>{student.fullName?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-bold text-2xl mb-2">{student.fullName}</h1>
            <p className="text-gray-500">
              {student.serviceDetails?.selectedSubjects?.join(", ")} student at SC Tutor
            </p>
          </div>
        </div>
        <div>
          <button
            title="Direct messaging with students isn't available - this opens your admin support thread instead"
            onClick={() => router.push("/lms-home/tutor/messages")}
            className="bg-blue-500 hover:bg-blue-700 py-2 px-3 text-white rounded cursor-pointer transition"
          >
            Send Message
          </button>
        </div>
      </div>

      {/* Contact details (parent/student email & phone) are deliberately never
          shown here - platform-mediated contact only, same policy as
          messaging (see stcbe's profile-access.service.ts). Use Messages to
          reach this family instead. */}
      <section className="bg-white mt-8 ml-8 mr-9 pl-12 py-5 space-y-5">
        <div className="flex gap-5">
          <div>
            <div className="flex gap-2">
              <IoMdContact className="mt-1" />
              <h3 className="font-bold">Gender</h3>
            </div>
            <p>{student.gender}</p>
          </div>
          <div>
            <div className="flex gap-2">
              <FcGlobe className="mt-1" />
              <label className="font-bold">Country</label>
            </div>
            <p>{student.countryOfResidence}</p>
          </div>
          <div>
            <div className="flex gap-2">
              <IoMdBook className="mt-1" />
              <h3 className="font-bold">Primary Language</h3>
            </div>
            <p>{student.primaryLanguage}</p>
          </div>
        </div>

        <div className="flex gap-20">
          <div>
            <div className="flex gap-2">
              <GiUpgrade className="mt-1" />
              <h3 className="font-bold">Age Level</h3>
            </div>
            <p>{student.serviceDetails?.ageLevel}</p>
          </div>
          <div>
            <div className="flex gap-2">
              <FcBarChart className="mt-1" />
              <h3 className="font-bold">Enrollment Status</h3>
            </div>
            <p>{student.enrollmentStatus}</p>
          </div>
        </div>
      </section>

      <section className="bg-white mt-8 ml-8 mr-9 pl-12 pr-9 py-5 space-y-5">
        <h2 className="font-bold text-xl">Learning Profile</h2>
        <p className="text-xs text-gray-500 -mt-3">What this student's family shared to help you teach effectively.</p>

        <div className="flex gap-5">
          <div>
            <div className="flex gap-2">
              <FaBirthdayCake className="mt-1 text-gray-500" />
              <h3 className="font-bold">Age</h3>
            </div>
            <p>{calculateAge(student.dateOfBirth) ?? "Not provided"}</p>
          </div>
        </div>

        {student.serviceDetails?.learningGoals && (
          <div>
            <div className="flex gap-2">
              <FaBullseye className="mt-1 text-gray-500" />
              <h3 className="font-bold">Learning Goals</h3>
            </div>
            <p className="whitespace-pre-wrap">{student.serviceDetails.learningGoals}</p>
          </div>
        )}

        {(student.serviceDetails?.specialNeeds || student.serviceDetails?.examPreparationDetails?.specialLearningNeeds) && (
          <div>
            <div className="flex gap-2">
              <FaHandsHelping className="mt-1 text-gray-500" />
              <h3 className="font-bold">Special Needs / Accommodations</h3>
            </div>
            <p className="whitespace-pre-wrap">
              {student.serviceDetails?.specialNeeds || student.serviceDetails?.examPreparationDetails?.specialLearningNeeds}
            </p>
          </div>
        )}
      </section>

      <section className="bg-white mt-8 ml-8 mr-9 pl-12 pr-9 py-5">
        <h2 className="font-bold text-xl mb-1">Academic Progress</h2>
        <p className="text-xs text-gray-500 mb-4">
          Attendance across all your lessons with this student, assignment completion and average grade on your
          courses, and overall course progress.
        </p>
        {summary ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl">
            <RingStat label="Attendance Record" percent={summary.attendanceRate} />
            <RingStat label="Assignment Completion" percent={summary.assignmentCompletionRate} />
            <RingStat label="Average Grade" percent={summary.averageGrade} />
            <RingStat label="Course Progress" percent={summary.courseProgressRate} />
          </div>
        ) : (
          <p className="text-sm text-gray-500">No academic data yet for this student.</p>
        )}
      </section>

      <section className="bg-white mt-8 ml-8 mr-9 pl-12 pr-9 py-5">
        <h2 className="font-bold text-xl mb-1">Give an Assignment</h2>
        <p className="text-xs text-gray-500 mb-4">Targeted at just {student.fullName}.</p>
        <div className="max-w-lg">
          <GiveAssignmentPanel studentId={student.id} onCreated={() => setGradingRefreshKey((k) => k + 1)} />
        </div>
      </section>

      <section className="bg-white mt-8 ml-8 mr-9 pl-12 pr-9 py-5">
        <h2 className="font-bold text-xl mb-1">Give a Resource</h2>
        <p className="text-xs text-gray-500 mb-4">
          Targeted at just {student.fullName} - stays hidden from them until an admin approves it.
        </p>
        <div className="max-w-lg">
          <GiveResourcePanel studentId={student.id} />
        </div>
      </section>

      <section className="bg-white mt-8 ml-8 mr-9 pl-12 pr-9 py-5">
        <h2 className="font-bold text-xl mb-4">Assignments &amp; Grading</h2>
        <StudentGradingPanel key={gradingRefreshKey} studentId={student.id} />
      </section>
    </section>
  );
}
