"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LibraryBig } from "lucide-react";
import { GetEnrollmentsAction, GetLinkedStudentsAction } from "@/server/enrollment";
import { GetStudentCoursesAction } from "@/server/course-enrollment";
import { GetCourseLessonsAction } from "@/server/lesson";
import { GetResourcesByCourseAction } from "@/server/resource";
import { Course, CourseTutor } from "@/types/course";
import { Lesson, LessonStatus } from "@/types/lesson";
import { CourseResource } from "@/types/resource";
import SecureVideoPlayer from "@/components/classroom/SecureVideoPlayer";
import JoinClassLink from "@/components/classroom/JoinClassLink";
import ResourceCard from "@/components/studentDashboard/ResourceCard";

export default function ClassroomPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [resources, setResources] = useState<CourseResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [linkedRes] = await GetLinkedStudentsAction();
      const [ownRes] = await GetEnrollmentsAction();
      const byId = new Map<string, true>();
      [...(linkedRes?.data ?? []), ...(ownRes?.data ?? [])].forEach((s) => byId.set(s.id, true));

      const courseEnrollmentLists = await Promise.all(
        Array.from(byId.keys()).map((id) => GetStudentCoursesAction(id))
      );

      const seen = new Map<string, Course>();
      courseEnrollmentLists.forEach(([res]) => {
        (res?.data ?? []).forEach((e) => {
          if (typeof e.course !== "string") seen.set(e.course.id, e.course);
        });
      });

      const myCourses = Array.from(seen.values());
      setCourses(myCourses);
      if (myCourses.length > 0) setSelectedCourseId(myCourses[0].id);
      setIsLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedCourseId) return;
    const load = async () => {
      const [res] = await GetCourseLessonsAction(selectedCourseId);
      const courseLessons = res?.data ?? [];
      setLessons(courseLessons);
      const recorded = courseLessons.find((l) => l.recordingUrl) ?? courseLessons[0] ?? null;
      setSelectedLessonId(recorded?.id ?? null);

      const [resourcesRes] = await GetResourcesByCourseAction(selectedCourseId);
      setResources(resourcesRes?.data ?? []);
    };
    load();
  }, [selectedCourseId]);

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) ?? null;
  const selectedLesson = lessons.find((l) => l.id === selectedLessonId) ?? null;
  const tutor = selectedCourse && typeof selectedCourse.tutor !== "string" ? (selectedCourse.tutor as CourseTutor) : null;

  const handleBack = () => {
    router.push(`/lms-home/student/dashboard`);
  };

  return (
    <div className="min-h-screen bg-white px-6 py-4">
      <div className="max-w-4xl mx-auto">
        {/**************** BACK BUTTON ****************/}
        <button
          onClick={handleBack}
          className="flex items-center text-gray-700 mb-6 hover:text-blue-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="font-bold">BACK</span>
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <LibraryBig className="text-blue-500" />
          <h1 className="text-lg font-semibold text-gray-800">Classroom</h1>
        </div>

        {isLoading ? (
          <p className="text-sm text-gray-500">Loading your classroom...</p>
        ) : courses.length === 0 ? (
          <p className="text-sm text-gray-500">
            You are not enrolled in any courses yet. Once you enroll, your lessons will appear here.
          </p>
        ) : (
          <>
            {/**************** COURSE SELECTOR ****************/}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
              <select
                value={selectedCourseId ?? ""}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="border border-gray-300 rounded-md p-2 text-sm w-full max-w-sm"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            {/**************** COURSE SECTION ****************/}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-700 mb-2">{selectedCourse?.title}</h3>
              {tutor && (
                <p className="text-gray-600">
                  <strong>{tutor.firstName} {tutor.lastName}</strong>
                </p>
              )}
            </div>

            {/**************** VIDEO CONTAINER ****************/}
            <div className="mb-10 bg-white rounded-lg shadow-md overflow-hidden">
              {selectedLesson?.recordingUrl ? (
                <SecureVideoPlayer url={selectedLesson.recordingUrl} />
              ) : (
                <div className="aspect-w-16 aspect-h-9 bg-gray-100 flex items-center justify-center py-16">
                  <p className="text-sm text-gray-500">No recording available for this lesson yet.</p>
                </div>
              )}
              {selectedLesson && (
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{selectedLesson.title}</h3>
                  <div className="flex items-center text-gray-600 mb-4 gap-4">
                    <span>{new Date(selectedLesson.scheduledDate).toLocaleDateString()}</span>
                    <span>{selectedLesson.durationMinutes} min</span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        selectedLesson.status === LessonStatus.COMPLETED
                          ? "bg-green-100 text-green-600"
                          : selectedLesson.status === LessonStatus.CANCELLED
                          ? "bg-red-100 text-red-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {selectedLesson.status}
                    </span>
                  </div>
                  {selectedLesson.description && <p className="text-gray-600 mb-4">{selectedLesson.description}</p>}
                  <div className="flex flex-wrap gap-3">
                    {selectedLesson.meetingUrl && selectedLesson.status === LessonStatus.SCHEDULED && (
                      <JoinClassLink
                        lessonId={selectedLesson.id}
                        scheduledDate={selectedLesson.scheduledDate}
                        durationMinutes={selectedLesson.durationMinutes}
                        className="flex items-center px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-md transition-colors"
                        label="Join Live Class"
                      />
                    )}
                    {selectedLesson.resourceUrls?.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center px-4 py-2 bg-gray-100 hover:bg-blue-100 hover:text-blue-600 rounded-md text-gray-700 transition-colors"
                      >
                        Resource {i + 1}
                      </a>
                    ))}
                    {selectedLesson.tutorComments && (
                      <p className="text-sm text-gray-500 w-full mt-2">Tutor notes: {selectedLesson.tutorComments}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/**************** COURSE DESCRIPTION ****************/}
            {selectedCourse?.description && (
              <div className="mb-10">
                <h3 className="text-lg font-medium text-gray-700 mb-2">Course Description</h3>
                <p className="text-gray-600">{selectedCourse.description}</p>
              </div>
            )}

            {/**************** MENTOR PROFILE ****************/}
            {tutor && (
              <div className="mb-10 bg-white rounded-lg shadow-md p-6">
                <h3 className="text-2xl font-bold text-blue-600 mb-3">Instructor</h3>
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-800">{tutor.firstName} {tutor.lastName}</h4>
                  <p className="text-sm text-gray-500">{tutor.email}</p>
                </div>
              </div>
            )}

            {/**************** LESSONS LIST ****************/}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">Lessons</h3>
              {lessons.length === 0 ? (
                <p className="text-sm text-gray-500">No lessons scheduled for this course yet.</p>
              ) : (
                <ul className="space-y-1 pb-2">
                  {lessons.map((lesson) => (
                    <li
                      key={lesson.id}
                      onClick={() => setSelectedLessonId(lesson.id)}
                      className={`flex items-center justify-between text-gray-600 hover:text-blue-500 cursor-pointer transition-colors hover:bg-gray-100 rounded px-3 py-2 ${
                        selectedLessonId === lesson.id ? "bg-blue-50 text-blue-600" : ""
                      }`}
                    >
                      <span>{lesson.recordingUrl ? "▶" : "○"} {lesson.title}</span>
                      <span className="text-xs text-gray-400">{lesson.durationMinutes}min</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/**************** RESOURCES ****************/}
            {resources.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-700 mb-2">Resources</h3>
                <div className="bg-white rounded-lg shadow-md px-4">
                  {resources.map((r) => (
                    <ResourceCard
                      key={r.id}
                      title={r.title}
                      type="Document"
                      added={new Date(r.createdAt).toLocaleDateString()}
                      size=""
                      href={r.fileUrl}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
