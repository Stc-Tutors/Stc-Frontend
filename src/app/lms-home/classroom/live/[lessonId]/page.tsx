"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Video, Clock } from "lucide-react";
import { GetLessonAction } from "@/server/lesson";
import { GetCourseAction } from "@/server/course";
import { Lesson } from "@/types/lesson";
import { Course } from "@/types/course";
import VirtualClassroomFrame from "@/components/classroom/VirtualClassroomFrame";
import { getJoinWindow } from "@/lib/class-join-window";

export default function LiveClassroomPage() {
  const { lessonId } = useParams();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const load = async () => {
      const [lessonRes, lessonError] = await GetLessonAction(lessonId as string);
      if (lessonError || !lessonRes?.data) {
        setError(lessonError || "Lesson not found");
        setIsLoading(false);
        return;
      }
      setLesson(lessonRes.data);
      const courseId = typeof lessonRes.data.course === "string" ? lessonRes.data.course : lessonRes.data.course.id;
      const [courseRes] = await GetCourseAction(courseId);
      setCourse(courseRes?.data ?? null);
      setIsLoading(false);
    };
    load();
  }, [lessonId]);

  // Re-check the join window every 15s so the page flips itself over to the
  // live iframe the moment the 10-minute pre-class window opens, with no
  // manual refresh needed.
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(interval);
  }, []);

  const joinWindow = lesson ? getJoinWindow(lesson.scheduledDate, lesson.durationMinutes, now) : null;

  return (
    <div className="min-h-screen bg-white px-6 py-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-700 mb-6 hover:text-blue-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="font-bold">BACK</span>
        </button>

        <div className="flex items-center gap-3 mb-6">
          <Video className="text-blue-500" />
          <h1 className="text-lg font-semibold text-gray-800">Virtual Classroom</h1>
        </div>

        {isLoading ? (
          <p className="text-sm text-gray-500">Loading classroom...</p>
        ) : error || !lesson?.meetingUrl ? (
          <p className="text-sm text-gray-500">
            {error || "This lesson doesn't have a live class link yet."}
          </p>
        ) : (
          <>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800">{lesson.title}</h2>
              {course && <p className="text-sm text-gray-500">{course.title}</p>}
            </div>
            {joinWindow?.isJoinable ? (
              <VirtualClassroomFrame meetingUrl={lesson.meetingUrl} />
            ) : (
              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg py-16 flex flex-col items-center gap-3 text-center">
                <Clock className="w-8 h-8 text-gray-400" />
                {joinWindow?.hasEnded ? (
                  <p className="text-sm text-gray-500">This class session has ended.</p>
                ) : (
                  <>
                    <p className="text-sm text-gray-600">
                      This room opens 10 minutes before class starts.
                    </p>
                    <p className="text-sm text-gray-500">
                      Class begins {new Date(lesson.scheduledDate).toLocaleString()}
                    </p>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
