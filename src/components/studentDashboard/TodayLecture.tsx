"use client";

import { useEffect, useState } from "react";
import { CalendarClock } from "lucide-react";
import JoinClassLink from "@/components/classroom/JoinClassLink";
import { hasJoinableClass } from "@/lib/class-join-window";
import { GetLinkedStudentsAction, GetEnrollmentsAction } from "@/server/enrollment";
import { GetStudentCoursesAction } from "@/server/course-enrollment";
import { formatScheduleTime } from "@/lib/datetime";
import { GetCourseLessonsAction } from "@/server/lesson";
import { Course } from "@/types/course";
import { Lesson } from "@/types/lesson";
import { matchesSelectedStudent, useSelectedStudent } from "@/contexts/selected-student-context";
import { courseTutorName } from "@/lib/tutor-name";

interface Row {
  lesson: Lesson;
  course: Course;
  // Set only when more than one child is in view - a single-child view already makes it obvious whose lecture
  // this is, so the extra label would just be noise there.
  childName?: string;
}

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

export default function TodayLectures() {
  const { selectedId, isAllSelected } = useSelectedStudent();
  const [rows, setRows] = useState<Row[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [linkedRes] = await GetLinkedStudentsAction();
      const [ownRes] = await GetEnrollmentsAction();
      const allStudents = [...(linkedRes?.data ?? []), ...(ownRes?.data ?? [])];
      const filtered = isAllSelected ? allStudents : allStudents.filter((s) => matchesSelectedStudent(s, selectedId));
      const byId = new Map<string, string>();
      filtered.forEach((s) => byId.set(s.id, s.fullName));

      const studentIds = Array.from(byId.keys());
      const courseEnrollmentLists = await Promise.all(studentIds.map((id) => GetStudentCoursesAction(id)));

      const courses = new Map<string, Course>();
      // Which of the children in view each course belongs to - a shared course (siblings in the same group class,
      // or the same tutor teaching two of them the same subject) can have more than one.
      const childNamesByCourse = new Map<string, Set<string>>();
      courseEnrollmentLists.forEach(([res], i) => {
        const childName = byId.get(studentIds[i]);
        (res?.data ?? []).forEach((e) => {
          if (typeof e.course === "string") return;
          courses.set(e.course.id, e.course);
          if (childName) {
            const set = childNamesByCourse.get(e.course.id) ?? new Set<string>();
            set.add(childName);
            childNamesByCourse.set(e.course.id, set);
          }
        });
      });

      const lessonLists = await Promise.all(
        Array.from(courses.keys()).map((courseId) => GetCourseLessonsAction(courseId))
      );

      // Only worth labelling when more than one child is actually in view this render.
      const showChildLabel = isAllSelected && filtered.length > 1;

      const todayRows: Row[] = [];
      lessonLists.forEach(([res], i) => {
        const courseId = Array.from(courses.keys())[i];
        const course = courses.get(courseId)!;
        const childName = showChildLabel ? Array.from(childNamesByCourse.get(courseId) ?? []).join(", ") : undefined;
        (res?.data ?? [])
          .filter((lesson) => isToday(lesson.scheduledDate))
          .forEach((lesson) => todayRows.push({ lesson, course, childName }));
      });

      todayRows.sort((a, b) => new Date(a.lesson.scheduledDate).getTime() - new Date(b.lesson.scheduledDate).getTime());
      setRows(todayRows);
      setIsLoading(false);
    };
    load();
  }, [selectedId, isAllSelected]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 space-y-3">
      <h3 className="font-semibold text-gray-800">Today's Lectures</h3>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-gray-500">No classes scheduled for today.</p>
      ) : (
        <div className="space-y-2">
          {rows.map(({ lesson, course, childName }) => (
            <div key={`${childName ?? ""}-${lesson.id}`} className="flex items-center gap-3 border rounded-lg p-3">
              <CalendarClock className="w-5 h-5 text-blue-500 shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-sm">
                  {course.title}
                  {childName && <span className="font-normal text-gray-500"> · {childName}</span>}
                </p>
                <p className="text-xs text-gray-500">
                  {lesson.title} · with {courseTutorName(course.tutor)}
                </p>
              </div>
              <span className="text-xs text-gray-600">
                {formatScheduleTime(lesson.scheduledDate)}
              </span>
              {hasJoinableClass(lesson) && (
                <JoinClassLink
                  lessonId={lesson.id}
                  scheduledDate={lesson.scheduledDate}
                  durationMinutes={lesson.durationMinutes}
                  className="text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-md px-2 py-1"
                  label="Join"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
