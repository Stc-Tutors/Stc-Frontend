"use client";

import Image from "next/image";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";

const mockClasses = [
  {
    avatar: "/image/testimonial3.jpg",
    tutor: "Peter Joe",
    grade: "Grade 9",
    subject: "Mathematics",
    curriculum: "Nigeria",
    update: "Completed",
    updateColor: "text-green-600",
  },
  {
    avatar: "/image/testimonial3.jpg",
    tutor: "Anita Doe",
    grade: "Grade 8",
    subject: "English",
    curriculum: "UK",
    update: "Live",
    updateColor: "text-red-500",
  },
  {
    avatar: "/image/testimonial3.jpg",
    tutor: "Anita Doe",
    grade: "Grade 8",
    subject: "English",
    curriculum: "UK",
    update: "Live",
    updateColor: "text-red-500",
  },
  {
    avatar: "/image/testimonial3.jpg",
    tutor: "Anita Doe",
    grade: "Grade 8",
    subject: "English",
    curriculum: "UK",
    update: "Live",
    updateColor: "text-red-500",
  },
  {
    avatar: "/image/testimonial3.jpg",
    tutor: "Anita Doe",
    grade: "Grade 8",
    subject: "English",
    curriculum: "UK",
    update: "Live",
    updateColor: "text-red-500",
  },
];

export default function YourClasses() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm overflow-x-auto relative">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Your Classes</h3>
        <button className="text-sm text-blue-500 hover:underline">View All</button>
      </div>

      <table className="w-full text-sm text-left">
        <thead>
          <tr className="text-gray-500 border-b">
            <th className="pb-2">Tutor</th>
            <th className="pb-2">Class Grade</th>
            <th className="pb-2">
              Subject <span className="text-xs">▲▼</span>
            </th>
            <th className="pb-2">
              Curriculum <span className="text-xs">▲▼</span>
            </th>
            <th className="pb-2">Class Update</th>
            <th className="pb-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {mockClasses.map((cls, i) => (
            <tr key={i} className="border-b">
              <td className="py-2 flex items-center gap-2">
                <Image
                  src={cls.avatar}
                  alt={cls.tutor}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                {cls.tutor}
              </td>
              <td className="py-2">{cls.grade}</td>
              <td className="py-2">{cls.subject}</td>
              <td className="py-2">{cls.curriculum}</td>
              <td className={`py-2 font-medium ${cls.updateColor}`}>
                {cls.update}
              </td>
              <td className="py-2 relative">
                <button
                  className="p-1 hover:bg-gray-100 rounded-full"
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>

                {openIndex === i && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow z-10">
                    <ul className="text-sm text-gray-700">
                      <li className="hover:bg-blue-50 hover:text-blue-500 px-4 py-2 cursor-pointer">View Details</li>
                      <li className="hover:bg-blue-50 hover:text-blue-500 px-4 py-2 cursor-pointer">Cancel Class</li>
                      <li className="hover:bg-blue-50 hover:text-blue-500 px-4 py-2 cursor-pointer">Reschedule Class</li>
                      <li className="hover:bg-blue-50 hover:text-blue-500 px-4 py-2 cursor-pointer">View Tutor Profile</li>
                    </ul>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
