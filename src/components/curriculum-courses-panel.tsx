"use client";

import { useState } from "react";
import Link from "next/link";
import CurriculumTreeBrowser from "@/components/curriculum-tree-browser";
import { CourseCatalog } from "@/components/course-catalog";
import { CurriculumNode } from "@/types/curriculum";
import { ITaxonomyStage } from "@/types/service-catalog";
import { Course, CourseStatus } from "@/types/course";

function statusBadgeClass(status: CourseStatus): string {
  if (status === CourseStatus.PUBLISHED) return "bg-green-100 text-green-700";
  if (status === CourseStatus.ARCHIVED) return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-700";
}

// The merged "Curriculum & Courses" tab body for the per-service workspace -
// a course IS the content unit attached to a leaf of the service's
// curriculum tree, so browsing the tree and managing the courses attached to
// wherever you're standing in it belong in one surface, not two disconnected
// tabs. Falls back to the flat moderation table alone when the service has
// no tree at all (taxonomyStages === []), since there's nothing to browse.
export default function CurriculumCoursesPanel({
  serviceType,
  serviceId,
  stages,
  courses,
}: {
  serviceType: string;
  serviceId: string;
  stages: ITaxonomyStage[];
  courses: Course[];
}) {
  const [viewMode, setViewMode] = useState<"tree" | "all">("tree");
  const [currentNode, setCurrentNode] = useState<CurriculumNode | null>(null);

  if (stages.length === 0) {
    return <CourseCatalog serviceType={serviceType} />;
  }

  const coursesUnderNode = courses.filter((c) => c.taxonomyNodeId === currentNode?.id);
  const returnTo = encodeURIComponent(`/lms-home/admin/service-catalog/${serviceId}`);
  const newCourseHref = `/lms-home/admin/courses/create?serviceSlug=${encodeURIComponent(serviceType)}&taxonomyNodeId=${
    currentNode?.id ?? ""
  }&returnTo=${returnTo}`;

  return (
    <div className="space-y-6">
      <div className="inline-flex rounded-lg bg-gray-100 p-1 text-sm">
        <button
          onClick={() => setViewMode("tree")}
          className={`px-3 py-1.5 rounded-md transition ${
            viewMode === "tree" ? "bg-white shadow-sm font-medium text-gray-900" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Browse tree
        </button>
        <button
          onClick={() => setViewMode("all")}
          className={`px-3 py-1.5 rounded-md transition ${
            viewMode === "all" ? "bg-white shadow-sm font-medium text-gray-900" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          All courses
        </button>
      </div>

      {viewMode === "tree" ? (
        <div className="space-y-6">
          <CurriculumTreeBrowser
            key={serviceType}
            serviceType={serviceType}
            stages={stages}
            onPositionChange={(parent) => setCurrentNode(parent)}
          />

          <div className="bg-white rounded-xl shadow-sm p-6 space-y-3 max-w-4xl">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">
                Courses under &quot;{currentNode?.name ?? "Root"}&quot;
              </h2>
              <Link href={newCourseHref} className="text-sm text-blue-600 hover:underline whitespace-nowrap">
                + New course under {currentNode?.name ?? "Root"}
              </Link>
            </div>
            {coursesUnderNode.length === 0 ? (
              <p className="text-sm text-gray-500">No courses attached here yet.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {coursesUnderNode.map((course) => (
                  <div key={course.id} className="py-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900">{course.title}</span>
                      <span className={`text-xs rounded-full px-2 py-0.5 ${statusBadgeClass(course.status)}`}>
                        {course.status}
                      </span>
                    </div>
                    <Link
                      href={`/lms-home/admin/courses/${course.id}/edit`}
                      className="text-xs text-blue-600 hover:underline whitespace-nowrap"
                    >
                      Edit
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <CourseCatalog serviceType={serviceType} />
      )}
    </div>
  );
}
