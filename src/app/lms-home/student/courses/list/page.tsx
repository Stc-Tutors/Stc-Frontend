"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Clock, Users, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GetCoursesAction } from "@/server/course";
import { EnrollInCourseAction } from "@/server/course-enrollment";
import { GetEnrollmentsAction } from "@/server/enrollment";
import { Course } from "@/types/course";

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [modal, setModal] = useState<{ courseId: string | null }>({ courseId: null });
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const [coursesRes] = await GetCoursesAction({ status: "PUBLISHED" });
      const [enrollmentsRes] = await GetEnrollmentsAction();
      setCourses(coursesRes?.data ?? []);
      setStudentId(enrollmentsRes?.data?.[0]?.id ?? null);
      setIsLoading(false);
    };
    load();
  }, []);

  const handleConfirm = async () => {
    if (!modal.courseId || !studentId) {
      setMessage("You need an active enrollment before joining a course.");
      setModal({ courseId: null });
      return;
    }
    setEnrolling(modal.courseId);
    const [, error] = await EnrollInCourseAction(modal.courseId, studentId);
    setEnrolling(null);
    setModal({ courseId: null });
    setMessage(error ? error : "Enrolled successfully!");
  };

  return (
    <div className="p-6 relative">
      {/* Top Section */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/lms-home/student/courses")}
            className="text-gray-600 hover:text-blue-800 flex items-center gap-1"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">My Courses</span>
          </button>
          <h2 className="text-2xl font-bold">All Courses</h2>
          <span />
        </div>
      </div>

      {message && <p className="text-sm text-blue-600 mb-4">{message}</p>}

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading courses...</p>
      ) : courses.length === 0 ? (
        <p className="text-sm text-gray-500">No published courses available yet.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col md:flex-row"
            >
              <div className="relative w-full md:w-1/3 h-48 md:h-auto">
                <Image
                  src={course.coverImageUrl || "/premium.png"}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-5 flex flex-col flex-1">
                <h2 className="text-lg font-semibold mb-2">{course.title}</h2>

                <div className="flex items-center text-sm text-gray-600 gap-6 mb-3">
                  <div className="flex items-center gap-1 text-blue-600">
                    <BookOpen className="w-4 h-4" />
                    <span>{course.curriculumOutline?.length ?? 0} Lessons</span>
                  </div>
                  <div className="flex items-center gap-1 text-blue-600">
                    <Users className="w-4 h-4" />
                    <span>{course.capacity ? `Max ${course.capacity}` : "Open"}</span>
                  </div>
                  {!!course.schedule?.[0] && (
                    <div className="flex items-center gap-1 text-blue-600">
                      <Clock className="w-4 h-4" />
                      <span>{course.schedule[0].duration} min</span>
                    </div>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-4">{course.description}</p>

                <div className="mt-auto flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {course.currency} {course.price}
                  </span>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/lms-home/student/courses/${course.id}`)}
                    >
                      View Detail
                    </Button>
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={enrolling === course.id}
                      onClick={() => setModal({ courseId: course.id })}
                    >
                      {enrolling === course.id ? "Enrolling..." : "Enroll"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal.courseId !== null && (
        <div className="fixed inset-0 bg-gray bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg text-center">
            <div className="mb-4">
              <span className="text-4xl">💡</span>
            </div>
            <h3 className="text-lg font-bold mb-2">Are You Sure You Want to Enroll in This Course?</h3>
            <p className="text-sm text-gray-600 mb-6">
              This will enroll you in the course and give you access to all lessons, resources, and assignments.
            </p>
            <div className="flex justify-between">
              <Button variant="outline" className="text-red-500 border-red-300" onClick={() => setModal({ courseId: null })}>
                Go Back
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleConfirm}>
                Enroll
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
