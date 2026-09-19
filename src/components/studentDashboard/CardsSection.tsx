"use client";

import { useEffect, useState } from "react";
import {
  PlayCircle,
  CheckSquare,
  Trophy,
  Users,
  Baby,
} from "lucide-react";
import { GetEnrollmentsAction, GetLinkedStudentsAction } from "@/server/enrollment";
import { GetStudentCoursesAction } from "@/server/course-enrollment";
import { CourseEnrollmentStatus } from "@/types/course-enrollment";
import { CourseTutor } from "@/types/course";
import { matchesSelectedStudent, useSelectedStudent } from "@/contexts/selected-student-context";

// showChildrenCount is only passed from the Parent dashboard - a student's
// own dashboard has no "children" concept.
export default function CardsSection({ showChildrenCount = false }: { showChildrenCount?: boolean }) {
  const { selectedId, isAllSelected, children } = useSelectedStudent();
  const [stats, setStats] = useState({ enrolled: 0, active: 0, completed: 0, tutors: 0 });

  useEffect(() => {
    const load = async () => {
      const [linkedRes] = await GetLinkedStudentsAction();
      const [ownRes] = await GetEnrollmentsAction();
      const allStudents = [...(linkedRes?.data ?? []), ...(ownRes?.data ?? [])];
      const studentIds = new Set(
        (isAllSelected ? allStudents : allStudents.filter((s) => matchesSelectedStudent(s, selectedId))).map(
          (s) => s.id
        )
      );
      if (studentIds.size === 0) {
        setStats({ enrolled: 0, active: 0, completed: 0, tutors: 0 });
        return;
      }

      const courseEnrollmentLists = await Promise.all(
        Array.from(studentIds).map((id) => GetStudentCoursesAction(id))
      );
      const enrollments = courseEnrollmentLists.flatMap(([res]) => res?.data ?? []);

      const tutorIds = new Set(
        enrollments
          .map((e) => (typeof e.course === "string" ? null : (e.course.tutor as CourseTutor)?.id))
          .filter(Boolean)
      );

      setStats({
        enrolled: enrollments.length,
        active: enrollments.filter((e) => e.status === CourseEnrollmentStatus.ACTIVE).length,
        completed: enrollments.filter((e) => e.status === CourseEnrollmentStatus.COMPLETED).length,
        tutors: tutorIds.size,
      });
    };
    load();
  }, [selectedId, isAllSelected]);

  const cards = [
    ...(showChildrenCount
      ? [{ title: "Enrolled Children", value: children.length, icon: Baby, iconColor: "text-pink-500", bgColor: "bg-pink-100" }]
      : []),
    { title: "Enrolled Courses", value: stats.enrolled, icon: PlayCircle, iconColor: "text-blue-500", bgColor: "bg-blue-100" },
    { title: "Active Courses", value: stats.active, icon: CheckSquare, iconColor: "text-purple-500", bgColor: "bg-purple-100" },
    { title: "Completed Courses", value: stats.completed, icon: Trophy, iconColor: "text-green-500", bgColor: "bg-green-100" },
    { title: "Course Tutors", value: stats.tutors, icon: Users, iconColor: "text-orange-500", bgColor: "bg-orange-100" },
  ];

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${showChildrenCount ? "lg:grid-cols-5" : "lg:grid-cols-4"}`}>
      {cards.map(({ title, value, icon: Icon, iconColor, bgColor }) => (
        <div
          key={title}
          className={`flex items-center gap-4 p-4 rounded-lg ${bgColor}`}
        >
          <div className="bg-white rounded-md p-3">
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
          <div>
            <p className="text-2xl font-semibold text-gray-800">{value.toLocaleString()}</p>
            <p className="text-sm text-gray-600">{title}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
