"use client";
import Image from 'next/image';
import { FaStar } from 'react-icons/fa';
import { Course, CourseTutor } from '@/types/course';

interface CourseCardProps {
  course: Course;
  onClick?: () => void;
}

const CourseCard = ({ course, onClick }: CourseCardProps) => {
  const tutor = course.tutor as CourseTutor;
  const tutorName = typeof course.tutor === "string" ? "" : `${tutor?.firstName ?? ""} ${tutor?.lastName ?? ""}`.trim();

  return (
    <div
      className="rounded-md shadow-sm w-full max-w-sm bg-white cursor-pointer hover:shadow-md transition"
      onClick={onClick}
    >
      <div className="relative">
        <Image
          src={course.coverImageUrl || "/premium.png"}
          width={400}
          height={200}
          alt="Course thumbnail"
          className="rounded-t-md object-cover h-40 w-full"
        />
        <div className="absolute top-2 right-2 bg-white text-yellow-500 px-2 py-1 rounded text-sm flex items-center">
          <FaStar size={12} className="mr-1" />
          {course.category}
        </div>
      </div>
      <div className="p-4 space-y-2">
        <span className="text-xs text-blue-600 font-semibold uppercase">{course.category}</span>
        <h2 className="font-medium text-gray-800">{course.title}</h2>
        <div className="flex items-center justify-between text-sm text-gray-600">
          {tutorName && <span>👨‍🏫 {tutorName}</span>}
          <span>{course.language}</span>
        </div>
        <div className="text-green-600 text-sm font-medium">
          {course.currency} {course.price}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
