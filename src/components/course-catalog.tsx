"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { GetCoursesAction, PublishCourseAction, ArchiveCourseAction } from "@/server/course";
import { DeleteCourseAction } from "@/server/admin";
import { Course, CourseStatus, CourseTutor } from "@/types/course";

// The course moderation/publishing list. Powers the "All courses" view of
// the per-service workspace's Curriculum & Courses tab (CurriculumCoursesPanel)
// - passing `serviceType` scopes the list to that service via
// GET /courses?serviceType= - so the flat table and the tree-scoped view
// never diverge. Mirrors Stc-SuperAdmin's component of the same name.
export function CourseCatalog({ serviceType, hideHeading }: { serviceType?: string; hideHeading?: boolean } = {}) {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    const [res] = await GetCoursesAction({ serviceType });
    setCourses(res?.data ?? []);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceType]);

  const handlePublish = async (id: string) => {
    const [, error] = await PublishCourseAction(id);
    setMessage(error);
    load();
  };

  const handleArchive = async (id: string) => {
    const [, error] = await ArchiveCourseAction(id);
    setMessage(error);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this course permanently?")) return;
    const [, error] = await DeleteCourseAction(id);
    setMessage(error);
    load();
  };

  return (
    <div className="bg-white shadow rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        {!hideHeading && <h1 className="text-2xl font-bold">Courses</h1>}
        <Button onClick={() => router.push("/lms-home/admin/courses/create")}>Create Course</Button>
      </div>
      {message && <p className="text-sm text-red-500">{message}</p>}

      {isLoading ? (
        <p className="text-sm text-gray-500 py-4">Loading courses...</p>
      ) : courses.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">No courses created yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Tutor</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => {
              const tutor = course.tutor as CourseTutor;
              return (
                <TableRow key={course.id}>
                  <TableCell
                    className="cursor-pointer text-blue-600 hover:underline"
                    onClick={() => router.push(`/lms-home/admin/courses/${course.id}`)}
                  >
                    {course.title}
                  </TableCell>
                  <TableCell>
                    {typeof course.tutor === "string" ? course.tutor : `${tutor.firstName} ${tutor.lastName}`}
                  </TableCell>
                  <TableCell>{course.category}</TableCell>
                  <TableCell>{course.status}</TableCell>
                  <TableCell className="text-right space-x-2">
                    {course.status !== CourseStatus.PUBLISHED && (
                      <Button size="sm" variant="outline" onClick={() => handlePublish(course.id)}>
                        Publish
                      </Button>
                    )}
                    {course.status !== CourseStatus.ARCHIVED && (
                      <Button size="sm" variant="outline" onClick={() => handleArchive(course.id)}>
                        Archive
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="text-red-500" onClick={() => handleDelete(course.id)}>
                      Delete
                    </Button>
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
