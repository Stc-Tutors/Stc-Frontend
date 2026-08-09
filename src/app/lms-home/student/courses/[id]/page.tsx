"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { GetCourseAction } from "@/server/course";
import { Course, CourseTutor } from "@/types/course";

export default function CourseDetailPage() {
  const { id } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const [res, err] = await GetCourseAction(id as string);
      if (err || !res?.data) {
        setError(err || "Course not found");
      } else {
        setCourse(res.data);
      }
      setIsLoading(false);
    };
    load();
  }, [id]);

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (error || !course) return <div className="p-6">{error || "Course not found"}</div>;

  const tutor = course.tutor as CourseTutor;
  const tutorName = typeof course.tutor === "string" ? "" : `${tutor?.firstName ?? ""} ${tutor?.lastName ?? ""}`.trim();

  return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-4xl mx-auto">
      <div className="mb-10">
        <h3 className="text-lg font-medium text-gray-700 mb-4">{course.title}</h3>
        {tutorName && (
          <p className="text-gray-600 mb-2">
            <strong>{tutorName}</strong>
          </p>
        )}
        <p className="text-sm text-gray-500">
          {course.category} &middot; {course.language}
        </p>
      </div>

      <div className="mb-10 bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">About this course</h3>
          <p className="text-gray-600 mb-4">{course.description}</p>
          <p className="text-sm font-medium text-gray-700">
            Price: {course.currency} {course.price}
            {course.capacity ? ` · Capacity: ${course.capacity}` : ""}
          </p>

          {!!course.schedule?.length && (
            <p className="text-sm text-gray-600 mt-2">
              Schedule: {course.schedule[0].days?.join(", ")} at {course.schedule[0].time} (
              {course.schedule[0].duration} min)
            </p>
          )}

          {!!course.curriculumOutline?.length && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-2">Curriculum</h4>
              <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                {course.curriculumOutline.map((item, i) => (
                  <li key={i}>
                    {item.title}
                    {item.description && <span className="text-gray-400"> — {item.description}</span>}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
