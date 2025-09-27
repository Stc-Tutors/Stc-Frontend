"use client";
import { useParams } from "next/navigation";

const courses = [
  {
    id: "1",
    title: "Data Analysis & Fundamentals",
    instructor: "Prof. Allison Peters",
    description: "This beginner-friendly course provides a comprehensive introduction to the fundamentals of data analysis...",
    video: "/your-video-file.mp4",
    duration: "12:45",
    lecture: "Lecture 1",
  },
  {
    id: "2",
    title: "Mathematics for Beginners",
    instructor: "Dr. James Carter",
    description: "Step-by-step guide to essential math concepts for beginners...",
    video: "/math-video.mp4",
    duration: "09:32",
    lecture: "Lecture 1",
  },
  {
    id: "3",
    title: "Chemistry Basics",
    instructor: "Dr. Linda Wong",
    description: "Understand atoms, molecules, and reactions in simple terms...",
    video: "/chemistry-video.mp4",
    duration: "11:20",
    lecture: "Lecture 1",
  },
];

export default function CourseDetailPage() {
  const { id } = useParams();
  const course = courses.find((c) => c.id === id);

  if (!course) return <div className="p-6">Course not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-4xl mx-auto">
      {/* Course Section */}
      <div className="mb-10">
        <h3 className="text-lg font-medium text-gray-700 mb-4">
          {course.title}
        </h3>
        <p className="text-gray-600 mb-6">
          <strong>{course.instructor}</strong>
        </p>
      </div>

      {/* Video Section */}
      <div className="mb-10 bg-white rounded-lg shadow-md overflow-hidden">
        <div className="aspect-w-16 aspect-h-9 bg-black">
          <video className="w-full h-full object-cover" controls poster="/video-poster.jpg">
            <source src={course.video} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {course.lecture}
          </h3>
          <div className="flex items-center text-gray-600 mb-4">
            <span className="mr-4">{course.lecture}</span>
            <span>Duration: {course.duration}</span>
          </div>
          <p className="text-gray-600 mb-4">{course.description}</p>
        </div>
      </div>
    </div>
  );
}
