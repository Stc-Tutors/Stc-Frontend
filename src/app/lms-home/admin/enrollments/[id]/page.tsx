"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserSearchSelect } from "@/components/user-search-select";
import { GetEnrollmentAction } from "@/server/enrollment";
import { LinkEnrollmentAction, UpdateEnrollmentStatusAction } from "@/server/admin";
import { GetStudentAttendanceAction } from "@/server/attendance";
import { GetStudentCoursesAction } from "@/server/course-enrollment";
import { EnrollmentStatus, Student, studentAvatarUrl } from "@/types/student";
import { AttendanceStatus } from "@/types/attendance";
import { UserRole } from "@/types/user";

export default function AdminEnrollmentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [parentUserId, setParentUserId] = useState("");
  const [studentUserId, setStudentUserId] = useState("");
  const [attendanceRate, setAttendanceRate] = useState<number | null>(null);
  const [courseCount, setCourseCount] = useState<number | null>(null);

  const load = async () => {
    const [res] = await GetEnrollmentAction(id as string);
    setStudent(res?.data ?? null);
    setParentUserId(res?.data?.parentUser ?? "");
    setStudentUserId(res?.data?.studentUser ?? "");

    if (res?.data) {
      const [attendanceRes] = await GetStudentAttendanceAction(id as string);
      const records = attendanceRes?.data ?? [];
      setAttendanceRate(
        records.length > 0
          ? Math.round(
              (records.filter((r) => r.status === AttendanceStatus.PRESENT || r.status === AttendanceStatus.LATE).length /
                records.length) *
                100
            )
          : null
      );

      const [coursesRes] = await GetStudentCoursesAction(id as string);
      setCourseCount(coursesRes?.data?.length ?? 0);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleStatusChange = async (status: EnrollmentStatus) => {
    const [, error] = await UpdateEnrollmentStatusAction(id as string, status);
    setMessage(error || `Status updated to ${status}`);
    load();
  };

  const handleLinkSave = async () => {
    const [, error] = await LinkEnrollmentAction(id as string, {
      parentUserId: parentUserId || null,
      studentUserId: studentUserId || null,
    });
    setMessage(error || "Link updated");
    load();
  };

  if (isLoading) return <p className="p-6">Loading...</p>;
  if (!student) return <p className="p-6">Enrollment not found</p>;

  return (
    <div className="bg-white shadow rounded-2xl p-6 max-w-2xl">
      <button
        onClick={() => router.push("/lms-home/admin/enrollments")}
        className="flex items-center text-gray-700 mb-4 hover:text-blue-500"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        <span className="text-sm font-bold">BACK</span>
      </button>

      <div className="flex items-center gap-4 mb-6">
        <Avatar className="h-14 w-14">
          <AvatarImage src={studentAvatarUrl(student.user)} alt={student.fullName} />
          <AvatarFallback>{student.fullName?.[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{student.fullName}</h1>
          <p className="text-gray-500">{student.parentEmail || "Hidden"}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 max-w-sm">
        <div className="border rounded-lg p-3 text-center">
          <p className="text-xl font-semibold text-gray-900">{attendanceRate != null ? `${attendanceRate}%` : "—"}</p>
          <p className="text-xs text-gray-500">Attendance rate</p>
        </div>
        <div className="border rounded-lg p-3 text-center">
          <p className="text-xl font-semibold text-gray-900">{courseCount ?? "—"}</p>
          <p className="text-xs text-gray-500">Enrolled courses</p>
        </div>
      </div>

      {message && <p className="text-sm text-blue-600 mb-4">{message}</p>}

      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-1">Enrollment status</p>
        <select
          value={student.enrollmentStatus}
          onChange={(e) => handleStatusChange(e.target.value as EnrollmentStatus)}
          className="border rounded-md px-3 py-2 text-sm w-full max-w-xs"
        >
          {Object.values(EnrollmentStatus).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="border-t pt-6">
        <h2 className="font-semibold mb-3">Parent / Student account link</h2>
        <p className="text-sm text-gray-500 mb-4">
          Override which user accounts this enrollment is linked to. Leave blank to unlink.
        </p>
        <div className="grid grid-cols-1 gap-4 max-w-md">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Parent account</label>
            <UserSearchSelect role={UserRole.PARENT} value={parentUserId} onChange={setParentUserId} placeholder="Search parent by name or email" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Student account</label>
            <UserSearchSelect role={UserRole.STUDENT} value={studentUserId} onChange={setStudentUserId} placeholder="Search student by name or email" />
          </div>
        </div>
        <Button className="mt-4" onClick={handleLinkSave}>
          Save link
        </Button>
        {(student.parentUser || student.studentUser) && (
          <button
            onClick={() => router.push(`/lms-home/profile/${student.studentUser || student.parentUser}`)}
            className="block mt-4 text-sm text-blue-600 hover:underline"
          >
            View linked account profile
          </button>
        )}
      </div>
    </div>
  );
}
