"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import CourseCard from '../../../../components/studentDashboard/CourseCard';
import { GetEnrollmentsAction } from '@/server/enrollment';
import { GetStudentCoursesAction } from '@/server/course-enrollment';
import { CourseEnrollmentStatus } from '@/types/course-enrollment';
import { Course } from '@/types/course';

export default function Home() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [counts, setCounts] = useState({ enrolled: 0, active: 0, completed: 0 });
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
      const enrollments = courseEnrollmentsRes?.data ?? [];
      const myCourses = enrollments
        .map((e) => (typeof e.course === "string" ? null : e.course))
        .filter((c): c is Course => !!c);

      setCourses(myCourses);
      setCounts({
        enrolled: enrollments.length,
        active: enrollments.filter((e) => e.status === CourseEnrollmentStatus.ACTIVE).length,
        completed: enrollments.filter((e) => e.status === CourseEnrollmentStatus.COMPLETED).length,
      });
      setIsLoading(false);
    };
    load();
  }, []);

  const handleBack = () => {
    router.push(`/lms-home/student/dashboard`);
  };

  return (
    <div className="flex">
      <div className="flex-1 bg-gray-50 p-8">
        {/* Back Button */}
      <button
        onClick={handleBack}
        className="flex items-center text-gray-700 mb-4 hover:text-blue-500"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        <span className="text-sm font-bold">BACK</span>
      </button>

        {/* Top bar */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">My Courses</h2>

          <Link href="/lms-home/student/courses/list">
          <button className="bg-blue-500 text-white hover:text-gray-800 px-4 py-2 rounded cursor-pointer">
            Browse Courses
            </button>
            </Link>
        </div>

        {/* Tabs */}
        <div className="flex space-x-6 mb-4">
          <span className="pb-1 text-blue-600 border-b-2 border-blue-600">
            Enrolled courses ({counts.enrolled})
          </span>
          <span className="text-gray-500">Active courses ({counts.active})</span>
          <span className="text-gray-500">Completed courses ({counts.completed})</span>
        </div>

        {isLoading ? (
          <p className="text-sm text-gray-500">Loading your courses...</p>
        ) : courses.length === 0 ? (
          <p className="text-sm text-gray-500">
            You are not enrolled in any courses yet. Browse courses to get started.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onClick={() => router.push(`/lms-home/student/courses/${course.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
