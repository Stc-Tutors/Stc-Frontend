"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AuthLayout from "@/components/layout/auth-layout";
import SpecialCourseRegisterForm from "@/components/forms/special-course-register-form";
import { GetSpecialCourseByTokenAction, PublicSpecialCourse } from "@/server/special-course";
import { EnrollViaShareTokenAction } from "@/server/course-enrollment";
import { GetLinkedStudentsAction } from "@/server/enrollment";
import { GetUserAction } from "@/server/user";
import { Button } from "@/components/ui/button";
import { ToastError, ToastSuccess } from "@/components/ui/custom/toast";
import { ROUTES } from "@/config/routes";
import { UserRole, User } from "@/types/user";
import { Student } from "@/types/student";
import Link from "next/link";

// Public landing page for a Special Course's shareable registration link
// (see Stc-SuperAdmin's special-course-form.tsx, which generates it). A
// brand-new visitor gets the registration form; someone who already has an
// account gets a direct "enroll now" flow instead of hitting a dead end
// (the register endpoint 400s on a duplicate email) - see
// CourseEnrollmentService.enrollViaShareToken.
export default function SpecialCourseRegisterPage() {
  const { token } = useParams();
  const [course, setCourse] = useState<PublicSpecialCourse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    Promise.all([GetSpecialCourseByTokenAction(token as string), GetUserAction()]).then(([[res, err], [userRes]]) => {
      setCourse(res?.data ?? null);
      setError(err);
      setCurrentUser(userRes?.data ?? null);
      setIsLoading(false);
    });
  }, [token]);

  if (isLoading) {
    return <AuthLayout title="Loading...">{null}</AuthLayout>;
  }

  if (error || !course) {
    return (
      <AuthLayout title="Course not found" subtitle="This registration link is invalid or no longer active.">
        {null}
      </AuthLayout>
    );
  }

  const canEnroll = currentUser?.role === UserRole.STUDENT || currentUser?.role === UserRole.PARENT;

  return (
    <AuthLayout title={course.title} subtitle={`${course.category} · ${course.currency} ${course.price}`}>
      <div className="space-y-6">
        <div className="text-sm text-gray-600 space-y-1">
          <p>{course.description}</p>
          {course.tutor && (
            <p className="text-xs text-gray-400">
              Taught by {course.tutor.firstName} {course.tutor.lastName}
            </p>
          )}
        </div>

        {currentUser ? (
          canEnroll ? (
            <ExistingUserEnroll token={token as string} user={currentUser} />
          ) : (
            <p className="text-sm text-gray-500 text-center">
              You&apos;re logged in as a {currentUser.role.toLowerCase()} - only a student or parent account can register
              for a course.
            </p>
          )
        ) : (
          <SpecialCourseRegisterForm token={token as string} />
        )}
      </div>
    </AuthLayout>
  );
}

function ExistingUserEnroll({ token, user }: { token: string; user: User }) {
  const [linkedStudents, setLinkedStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [isLoadingStudents, setIsLoadingStudents] = useState(user.role === UserRole.PARENT);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    if (user.role !== UserRole.PARENT) return;
    GetLinkedStudentsAction().then(([res]) => {
      const students = res?.data ?? [];
      setLinkedStudents(students);
      if (students.length === 1) setSelectedStudentId(students[0].id);
      setIsLoadingStudents(false);
    });
  }, [user.role]);

  const handleEnroll = async () => {
    setIsEnrolling(true);
    const [, error] = await EnrollViaShareTokenAction(token, selectedStudentId || undefined);
    setIsEnrolling(false);
    if (error) {
      ToastError(error);
      return;
    }
    ToastSuccess("Enrolled successfully");
    setEnrolled(true);
  };

  if (enrolled) {
    return (
      <div className="text-center space-y-4">
        <p className="text-sm text-gray-700">You&apos;re enrolled. Head to your dashboard to get started.</p>
        <Link href={ROUTES.DASHBOARD.HOME}>
          <Button className="w-full bg-[#3b5bdb] hover:bg-blue-800 text-white">Go to dashboard</Button>
        </Link>
      </div>
    );
  }

  if (isLoadingStudents) {
    return <p className="text-sm text-gray-500 text-center">Loading your account...</p>;
  }

  if (user.role === UserRole.PARENT && linkedStudents.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center">
        Add a child to your account first, then come back to this link to enroll them.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-700 text-center">
        You&apos;re logged in as {user.firstName} {user.lastName}.
      </p>
      {user.role === UserRole.PARENT && linkedStudents.length > 1 && (
        <select
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
        >
          <option value="">Select which child to enroll...</option>
          {linkedStudents.map((s) => (
            <option key={s.id} value={s.id}>
              {s.fullName}
            </option>
          ))}
        </select>
      )}
      <Button
        onClick={handleEnroll}
        disabled={isEnrolling || (user.role === UserRole.PARENT && linkedStudents.length > 1 && !selectedStudentId)}
        className="w-full bg-[#3b5bdb] hover:bg-blue-800 text-white"
      >
        {isEnrolling ? "Enrolling..." : "Enroll now"}
      </Button>
    </div>
  );
}
