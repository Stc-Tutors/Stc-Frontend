"use client";
import { useState } from 'react';
import CourseCard from '../../../components/CourseCard';

export default function Home() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(true);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="flex">
      <div className="flex-1 bg-gray-50 p-8">
        {/* Top bar */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">All courses</h2>
          <button className="bg-blue-500 text-white px-4 py-2 rounded">Course List</button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-6 mb-4">
          <button
            onClick={toggleDropdown}
            className={`pb-1 cursor-pointer border-b-2 transition-all duration-300 ${
              isDropdownOpen ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent'
            }`}
          >
            Enrolled courses (20)
          </button>

          <span className="text-gray-500 cursor-pointer">Active courses (0)</span>
          <span className="text-gray-500 cursor-pointer">Completed courses (4)</span>
        </div>

        {/* Dropdown with transition */}
        <div
          className={`transition-all duration-300 overflow-hidden ${
            isDropdownOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <CourseCard />
            <CourseCard />
            <CourseCard />
            <CourseCard />
            <CourseCard />
            <CourseCard />
          </div>
        </div>
      </div>
    </div>
  );
}
