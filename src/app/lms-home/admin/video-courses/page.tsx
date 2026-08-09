"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GetCoursesAction } from "@/server/course";
import { GetAdminServicesAction } from "@/server/service-catalog";
import { Course, CourseStatus } from "@/types/course";

function statusBadgeClass(status: CourseStatus): string {
  if (status === CourseStatus.PUBLISHED) return "bg-green-100 text-green-700";
  if (status === CourseStatus.ARCHIVED) return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-700";
}

// Flat, cross-service course browser - replaces the old standalone /courses
// moderation table for the "just show me every course" use case. Row click
// jumps straight into that course's Video Lessons tab in its service
// workspace (?tab=courses&course=<id> - "courses" is the tab's `value`,
// unchanged even though its label is now "Video Lessons", so this link
// keeps working), since that's what an admin coming from a flat list is
// almost always here to do - author lesson recordings, not re-litigate the
// course's structural fields.
export default function VideoCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  // slug -> service Mongo id, needed to build the service-workspace link.
  const [serviceIdBySlug, setServiceIdBySlug] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [coursesRes] = await GetCoursesAction();
      const [servicesRes] = await GetAdminServicesAction();
      setCourses(coursesRes?.data ?? []);
      setServiceIdBySlug(
        Object.fromEntries((servicesRes?.data ?? []).map((s) => [s.slug, s.id]))
      );
      setIsLoading(false);
    })();
  }, []);

  const goToCourse = (course: Course) => {
    const serviceId = serviceIdBySlug[course.serviceType];
    if (!serviceId) return;
    router.push(`/lms-home/admin/service-catalog/${serviceId}?tab=courses&course=${course.id}`);
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
              const serviceId = serviceIdBySlug[course.serviceType];
              return (
                <TableRow
                  key={course.id}
                  className={serviceId ? "cursor-pointer" : ""}
                  onClick={() => goToCourse(course)}
                >
                  <TableCell className={serviceId ? "text-blue-600 hover:underline" : ""}>{course.title}</TableCell>
                  <TableCell className="font-mono text-xs">{course.serviceType}</TableCell>
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
