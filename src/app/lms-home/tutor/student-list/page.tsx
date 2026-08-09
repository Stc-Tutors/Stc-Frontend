"use client";

import { Suspense, useEffect, useState } from "react";
import { ArrowLeft, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import TutorsCard from "@/components/tutorDashboard/TutorsCard"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter, useSearchParams } from "next/navigation";
import { GetMyCourseStudentsAction } from "@/server/course";
import { Student, studentAvatarUrl } from "@/types/student";

export default function StudentsPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-gray-500">Loading...</p>}>
      <StudentsPageInner />
    </Suspense>
  );
}

function StudentsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = (searchParams.get("q") || "").toLowerCase();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [res] = await GetMyCourseStudentsAction();
      setStudents(res?.data ?? []);
      setIsLoading(false);
    };
    load();
  }, []);

  const filteredStudents = query
    ? students.filter((s) => s.fullName?.toLowerCase().includes(query))
    : students;

  const handleBack = () => {
    router.push(`/lms-home/tutor/dashboard`);
  };

  // ---- Pagination ----
  const pageSize = 12;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const start = (page - 1) * pageSize;
  const current = filteredStudents.slice(start, start + pageSize);

  const goTo = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  return (
    <div className="bg-white shadow rounded-2xl p-6">
      {/* Back nav */}
      <button
        onClick={handleBack}
        className="flex items-center text-1xl-gray-700 mb-4 cursor-pointer hover:text-blue-500">
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="text-1xl font-bold">BACK</span>
      </button>

        <div className="space-y-6 mb-6">
            <TutorsCard/>
        </div>
      <h1 className="text-2xl font-bold mb-6">
        Your Students{query ? <span className="text-base font-normal text-gray-500"> — search: "{query}"</span> : ""}
      </h1>

      {isLoading ? (
        <p className="text-sm text-gray-500 py-4">Loading students...</p>
      ) : students.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">
          No students yet. Once someone enrolls in one of your courses, they will show up here.
        </p>
      ) : filteredStudents.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">No students match "{query}".</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {current.map((student) => (
              <div
                key={student.id}
                className="relative bg-white border rounded-2xl shadow-sm p-4 flex flex-col items-center gap-2 text-center hover:shadow-md transition"
              >
                <div className="absolute top-2 right-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <MoreHorizontal className="h-5 w-5 cursor-pointer text-gray-400 hover:text-gray-700" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/lms-home/tutor/student-list/${student.id}`)}>
                        View enrollment
                      </DropdownMenuItem>
                      {student.studentUser && (
                        <DropdownMenuItem onClick={() => router.push(`/lms-home/profile/${student.studentUser}`)}>
                          View profile
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <Avatar className="h-16 w-16">
                  <AvatarImage src={studentAvatarUrl(student.user)} alt={student.fullName} />
                  <AvatarFallback>{student.fullName?.[0]}</AvatarFallback>
                </Avatar>
                <p className="font-medium truncate w-full">{student.fullName}</p>
                <p className="text-xs text-gray-500 truncate w-full">
                  {student.serviceDetails?.selectedSubjects?.join(", ") || "No subjects yet"}
                </p>
                <p className="text-xs text-gray-400">{student.serviceDetails?.ageLevel}</p>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                  {student.enrollmentStatus}
                </span>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              className="px-3 py-1.5 rounded border text-sm disabled:opacity-50"
              onClick={() => goTo(page - 1)}
              disabled={page === 1}
            >
              Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => goTo(p)}
                className={`px-3 py-1.5 rounded border text-sm ${
                  p === page
                    ? "bg-blue-600 text-white border-blue-600"
                    : "hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              className="px-3 py-1.5 rounded border text-sm disabled:opacity-50"
              onClick={() => goTo(page + 1)}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
