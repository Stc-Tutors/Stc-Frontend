"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Clock, Users, BookOpen, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const courses = [
  {
    id: 1,
    title: "Introduction to Physics",
    image: "/image/physics.jpg",
    lessons: 12,
    students: 230,
    duration: "6h 30m",
    description:
      "Learn the fundamentals of physics including motion, energy, and forces.",
    price: 49.99,
    rating: 4,
  },
  {
    id: 2,
    title: "Mathematics for Beginners",
    image: "/image/mathematics.jpg",
    lessons: 20,
    students: 310,
    duration: "10h 15m",
    description:
      "Step-by-step guide to essential math concepts for beginners.",
    price: 59.99,
    rating: 5,
  },
  {
    id: 3,
    title: "Chemistry Basics",
    image: "/image/chemistry.jpg",
    lessons: 15,
    students: 180,
    duration: "7h 45m",
    description: "Understand atoms, molecules, and reactions in simple terms.",
    price: 39.99,
    rating: 3,
  },
];

export default function CoursesPage() {
  const router = useRouter();
  const [enrolledCourses, setEnrolledCourses] = useState<number[]>([]);
  const [modal, setModal] = useState<{ action: "add" | "remove"; courseId: number | null }>({
    action: "add",
    courseId: null,
  });

  const handleConfirm = () => {
    if (modal.courseId !== null) {
      if (modal.action === "add" && !enrolledCourses.includes(modal.courseId)) {
        setEnrolledCourses([...enrolledCourses, modal.courseId]);
      } else if (modal.action === "remove") {
        setEnrolledCourses(enrolledCourses.filter((id) => id !== modal.courseId));
      }
    }
    setModal({ action: "add", courseId: null }); // close modal
  };

  return (
    <div className="p-6 relative">
      {/* Top Section */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center justify-between">
          {/* Back Breadcrumb */}
          <button
            onClick={() => router.push("/lms-home/student/scheduling")}
            className="text-gray-600 hover:text-blue-800 flex items-center gap-1"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">My Schedule / My Courses</span>
          </button>

          {/* Page Title */}
          <h2 className="text-2xl font-bold">All Courses</h2>

          {/* Dropdown */}
          <Button
            variant="outline"
            className="rounded-lg border-gray-300 text-gray-600 hover:text-blue-600"
          >
            New Published ⌄
          </Button>
        </div>
      </div>

      {/* Courses List */}
      <div className="flex flex-col gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col md:flex-row"
          >
            {/* Left Image */}
            <div className="relative w-full md:w-1/3 h-48 md:h-auto">
              <Image
                src={course.image}
                alt={course.title}
                fill
                className="object-cover"
              />
            </div>

            {/* Right Content */}
            <div className="p-5 flex flex-col flex-1">
              {/* Rating */}
              <div className="flex items-center gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < course.rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>

              {/* Title */}
              <h2 className="text-lg font-semibold mb-2">{course.title}</h2>

              {/* Info Row */}
              <div className="flex items-center text-sm text-gray-600 gap-6 mb-3">
                <div className="flex items-center gap-1 text-blue-600">
                  <BookOpen className="w-4 h-4" />
                  <span>{course.lessons} Lessons</span>
                </div>
                <div className="flex items-center gap-1 text-blue-600">
                  <Users className="w-4 h-4" />
                  <span>{course.students} Students</span>
                </div>
                <div className="flex items-center gap-1 text-blue-600">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4">{course.description}</p>

              {/* Price + Actions */}
              <div className="mt-auto flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Plus/Minus */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-8 h-8 rounded-full"
                      onClick={() => setModal({ action: "add", courseId: course.id })}
                    >
                      +
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      className="w-8 h-8 rounded-full"
                      onClick={() => setModal({ action: "remove", courseId: course.id })}
                    >
                      -
                    </Button>
                  </div>

                  {/* Price */}
                  <span className="text-sm font-medium text-gray-700">
                    Paid ${course.price}
                  </span>
                </div>

                {/* View Detail */}
                <Button
                  variant="default"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => router.push(`lms-home/student/courses/${course.id}`)}
                >
                  View Detail
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal.courseId !== null && (
        <div className="fixed inset-0 bg-gray bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg text-center">
            {/* Icon */}
            <div className="mb-4">
                {modal.action === "add" ? (
                    <span className="text-4xl">💡</span>
                ) : (
                <span className="text-4xl text-red-500">⚠️</span>
                )}
                </div>

            <h3 className="text-lg font-bold mb-2">
              {modal.action === "add"
                ? "Are You Sure You Want to Add This Course?"
                : "Are You Sure You Want to Remove This Course?"}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {modal.action === "add"
                ? "You are about to add this course to your dashboard. This will enroll you in the course and give you access to all lessons, resources, and assignments. Would you like to continue?"
                : "You are about to remove this course from your dashboard. This will unenroll you from the course, and you will lose access to all materials and progress. Would you like to continue?"}
            </p>
            <div className="flex justify-between">
              <Button
                variant="outline"
                className="text-red-500 border-red-300"
                onClick={() => setModal({ action: "add", courseId: null })}
              >
                Go Back
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleConfirm}
              >
                {modal.action === "add" ? "Add Course" : "Remove Course"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
