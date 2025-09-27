"use client";

import Image from "next/image";
import { BookOpen, Users, Calendar } from "lucide-react";

export default function CourseHeader() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 flex flex-col md:flex-row gap-6">
      {/* Course Image */}
      <div className="w-full md:w-40 h-28 md:h-32 relative flex-shrink-0">
        <Image
          src="/image/mathematics.jpg" 
          alt="Course thumbnail"
          fill
          className="object-cover rounded-lg"
        />
      </div>

      {/* Middle Info */}
      <div className="flex-1 flex flex-col gap-2">
        {/* Uploaded Info */}
        <div className="text-xs text-gray-500">
          Uploaded: <span className="font-medium">Jun 12, 2025</span> • Last Updated:{" "}
          <span className="font-medium">Jun 17, 2025</span>
        </div>

        {/* Title */}
        <h2 className="text-lg md:text-xl font-semibold text-gray-800">
          2025 Mathematics Basic Learning From Beginner to Pro
        </h2>

        {/* Course type */}
        <p className="text-sm text-gray-500">
          3 in 1 Course (Learn to pass your mathematics exams with confidence)
        </p>

        {/* Lessons / Students / Weeks */}
        <div className="flex flex-wrap items-center gap-6 mt-1">
          <div className="flex items-center gap-1 text-sm text-gray-700">
            <BookOpen className="w-4 h-4 text-blue-500" />
            <span>68 Lessons</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-700">
            <Users className="w-4 h-4 text-green-500" />
            <span>840 Students</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-700">
            <Calendar className="w-4 h-4 text-orange-500" />
            <span>12 Weeks</span>
          </div>
        </div>

        {/* Star rating */}
        <div className="flex items-center gap-2 mt-1">
          <div className="flex text-yellow-400">
            ★★★★★ {/* replace with a star component if you want */}
          </div>
          <span className="text-sm text-gray-600">4.8 (420 ratings)</span>
        </div>
      </div>

      {/* Right Side Earnings */}
      <div className="flex flex-col items-end justify-between gap-2 w-full md:w-auto">
        <div className="text-gray-700 text-sm">
          <p className="font-semibold">$13.99</p>
          <p className="text-xs text-gray-500">Earning this month</p>
        </div>
        <div className="text-gray-700 text-sm">
          <p className="font-semibold">$13,090,455.82</p>
          <p className="text-xs text-gray-500">Total earnings</p>
        </div>
        <button className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg">
          Request Withdrawal
        </button>
      </div>
    </div>
  );
}
