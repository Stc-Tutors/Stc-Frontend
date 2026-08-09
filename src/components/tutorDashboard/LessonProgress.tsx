"use client";

import { useEffect, useState } from "react";
import { Circle } from "rc-progress";
import { GetMyCoursesAction } from "@/server/course";
import { GetCourseLessonsAction } from "@/server/lesson";
import { GetNotificationsAction } from "@/server/notification";
import { LessonStatus } from "@/types/lesson";

const LEGEND_COLORS = ["bg-blue-500", "bg-orange-500", "bg-sky-400", "bg-green-500", "bg-purple-500"];

export default function LessonProgress() {
  const [progress, setProgress] = useState(0);
  const [courseNames, setCourseNames] = useState<string[]>([]);
  const [announcements, setAnnouncements] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [coursesRes] = await GetMyCoursesAction();
      const courses = coursesRes?.data ?? [];
      setCourseNames(courses.map((c) => c.title).slice(0, 3));

      const lessonLists = await Promise.all(courses.map((c) => GetCourseLessonsAction(c.id)));
      const allLessons = lessonLists.flatMap(([res]) => res?.data ?? []);
      if (allLessons.length > 0) {
        setProgress(
          Math.round((allLessons.filter((l) => l.status === LessonStatus.COMPLETED).length / allLessons.length) * 100)
        );
      }

      const [notificationsRes] = await GetNotificationsAction();
      setAnnouncements((notificationsRes?.data ?? []).slice(0, 5).map((n) => n.body));

      setIsLoading(false);
    };
    load();
  }, []);

  const visibleAnnouncements = expanded ? announcements : announcements.slice(0, 1);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
      {/* Title */}
      <div>
        <h3 className="font-semibold text-gray-800">Lessons</h3>
        <p className="text-sm text-gray-500">This Semester</p>
      </div>

      {/* Donut Progress */}
      <div className="flex justify-center items-center">
        <div className="relative w-[120px] h-[120px]">
          <Circle percent={progress} strokeWidth={8} trailWidth={8} strokeColor="#3b82f6" trailColor="#e5e7eb" />
          <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-800">
            {progress}%
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 text-sm flex-wrap">
        {courseNames.length === 0 ? (
          <span className="text-gray-400 text-xs">No courses yet</span>
        ) : (
          courseNames.map((name, i) => (
            <div key={name} className="flex items-center gap-1 text-gray-700">
              <span className={`w-3 h-3 rounded-full inline-block ${LEGEND_COLORS[i % LEGEND_COLORS.length]}`}></span> {name}
            </div>
          ))
        )}
      </div>

      {/* Announcement */}
      <div className="border-t pt-3 mt-2">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-semibold text-gray-800 text-sm">Announcement</h4>
          {announcements.length > 1 && (
            <button onClick={() => setExpanded(!expanded)} className="text-sm text-blue-500 hover:underline">
              {expanded ? "Hide" : "View all"}
            </button>
          )}
        </div>
        <ul className="space-y-1 text-sm text-gray-600">
          {isLoading ? (
            <li className="text-gray-400">Loading...</li>
          ) : visibleAnnouncements.length === 0 ? (
            <li className="text-gray-400">No announcements yet.</li>
          ) : (
            visibleAnnouncements.map((item, i) => (
              <li key={i} className="border-b pb-1 last:border-none">{item}</li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
