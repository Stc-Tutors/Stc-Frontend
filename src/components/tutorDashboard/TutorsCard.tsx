"use client";

import { useEffect, useState } from "react";
import { BookOpen, Users, CheckSquare, FileEdit } from "lucide-react";
import { GetMyCoursesAction, GetMyCourseStudentsAction } from "@/server/course";
import { CourseStatus } from "@/types/course";

export default function TutorsCard() {
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0, students: 0 });

  useEffect(() => {
    const load = async () => {
      const [coursesRes] = await GetMyCoursesAction();
      const [studentsRes] = await GetMyCourseStudentsAction();
      const courses = coursesRes?.data ?? [];

      setStats({
        total: courses.length,
        published: courses.filter((c) => c.status === CourseStatus.PUBLISHED).length,
        draft: courses.filter((c) => c.status === CourseStatus.DRAFT).length,
        students: studentsRes?.data?.length ?? 0,
      });
    };
    load();
  }, []);

  const cards = [
    { title: "My Courses", value: stats.total, icon: BookOpen, iconColor: "text-orange-500", bgColor: "bg-orange-100" },
    { title: "Enrolled Students", value: stats.students, icon: Users, iconColor: "text-pink-500", bgColor: "bg-pink-100" },
    { title: "Published Courses", value: stats.published, icon: CheckSquare, iconColor: "text-green-500", bgColor: "bg-green-100" },
    { title: "Draft Courses", value: stats.draft, icon: FileEdit, iconColor: "text-purple-500", bgColor: "bg-purple-100" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ title, value, icon: Icon, iconColor, bgColor }) => (
        <div
          key={title}
          className={"flex items-center gap-4 p-4 rounded-lg bg-white shadow-sm"}
        >
          <div className={`rounded-md p-3 ${bgColor}`}>
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
