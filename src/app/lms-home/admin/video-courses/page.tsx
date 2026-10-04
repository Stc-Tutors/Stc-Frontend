"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GetCoursesAction } from "@/server/course";
import { GetServicesAction } from "@/server/service-catalog";
import { Course, CourseStatus } from "@/types/course";

function statusBadgeClass(status: CourseStatus): string {
  if (status === CourseStatus.PUBLISHED) return "bg-green-100 text-green-700";
  if (status === CourseStatus.ARCHIVED) return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-700";
}

// Flat, cross-service course browser. Row click opens that course's video
// lessons in their own page (./lessons) - deliberately NOT the Service Catalog
// workspace, which is Super Admin only and holds the service's structure and
// settings, none of which a video-course admin should be able to reach.
export default function VideoCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  // slug -> display name, so the table shows "Academic Tutoring" instead of
  // the raw "academic-tutoring" slug.
  const [serviceNameBySlug, setServiceNameBySlug] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [coursesRes] = await GetCoursesAction();
      const [servicesRes] = await GetServicesAction();
      setCourses(coursesRes?.data ?? []);
      setServiceNameBySlug(
        Object.fromEntries((servicesRes?.data ?? []).map((s) => [s.slug, s.serviceName]))
      );
      setIsLoading(false);
    })();
  }, []);

  const goToCourse = (course: Course) => {
    router.push(`/lms-home/admin/video-courses/lessons?service=${encodeURIComponent(course.serviceType)}&course=${course.id}`);
  };

  return (
    <div className="bg-white shadow rounded-2xl p-6 space-y-4">
      <h1 className="text-2xl font-bold">Video Courses</h1>
      <p className="text-sm text-gray-500">
        Every course across every service - click one to manage its video lessons.
      </p>

      {isLoading ? (
        <p className="text-sm text-gray-500 py-4">Loading courses...</p>
      ) : courses.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">No courses created yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => {
              return (
                <TableRow key={course.id} className="cursor-pointer" onClick={() => goToCourse(course)}>
                  <TableCell className="text-blue-600 hover:underline">{course.title}</TableCell>
                  <TableCell>{serviceNameBySlug[course.serviceType] ?? course.serviceType}</TableCell>
                  <TableCell>
                    <span className={`text-xs rounded-full px-2 py-0.5 ${statusBadgeClass(course.status)}`}>
                      {course.status}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
