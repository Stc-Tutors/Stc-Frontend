"use client";

import { useEffect, useState, useRef } from "react";
import { ArrowLeft, CalendarSync, MoreHorizontal } from "lucide-react";
import { Calendar, FileText, BookOpen} from "lucide-react";
import Link from "next/link";
import CardsSection from "@/components/studentDashboard/CardsSection";
import { useRouter } from "next/navigation";

const tabs = [
  { label: "Schedule", icon: Calendar },
  { label: "Exam", icon: FileText },
  { label: "Resource Library", icon: BookOpen },
];

const classData = [
  {
    subject: "Mathematics",
    teacher: "Mrs. Adeola",
    profilePic: "/images/tutors/adeola.jpg",
    status: "Upcoming",
    date: "July 20, 2025",
  },
  {
    subject: "English",
    teacher: "Mr. Johnson",
    profilePic: "/images/tutors/johnson.jpg",
    status: "Submitted",
    date: "July 12, 2025",
  },
  {
    subject: "Biology",
    teacher: "Dr. Kingsley",
    status: "Pending",
    date: "July 14, 2025",
  },
  {
    subject: "Physics",
    teacher: "Dr. Josh",
    status: "Pending",
    date: "July 25, 2025",
  },
  {
    subject: "Chemistry",
    teacher: "Mr. Aaron",
    status: "Pending",
    date: "August 04, 2025",
  },
  {
    subject: "Computer Science",
    teacher: "Mrs. Ajayi",
    status: "Submitted",
    date: "July 14, 2025",
  },
  {
    subject: "Government",
    teacher: "Mr. Debo",
    status: "Upcoming",
    date: "August 11, 2025",
  },
  {
    subject: "Accounting",
    teacher: "Mr. Tosin",
    status: "Drafted",
    date: "July 14, 2025",
  },
  {
    subject: "Literature-in-English",
    teacher: "Miss. Abigael",
    status: "Drafted",
    date: "September 25, 2025",
  },
  {
    subject: "Commerce",
    teacher: "Mr. Gbenga",
    status: "Upcoming",
    date: "July 14, 2025",
  },
  {
    subject: "Economics",
    teacher: "Mr. Kelechi",
    status: "Pending",
    date: "August 30, 2025",
  },
];

export default function SchedulePage() {
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("Schedule");

  const router = useRouter();

  const handleBack = () => {
    router.push(`/lms-home/student/dashboard`);
  };

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownIndex(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (index: number) => {
    setOpenDropdownIndex(prev => (prev === index ? null : index));
  };

  const formatSubject = (subject: string) =>
    encodeURIComponent(subject.trim().toLowerCase().replace(/\s+/g, "-"));
  
  return (
    <div className="space-y-6">
      {/**************************BACK**************************/}
      <button
        onClick={handleBack}
        className="flex items-center text-1xl-gray-700 mb-4 cursor-pointer hover:text-blue-500">
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="text-1xl font-bold">BACK</span>
      </button>

      {/* Header */}
      <div className="flex items-center gap-3">
        <CalendarSync className="text-blue-500"/>
        <h1 className="text-lg font-semibold text-gray-800">Schedule</h1>
      </div>

      {/* Cards Section */}
    <CardsSection />
    
      {/* Tabs */}
      <div className="flex gap-6 border-b pb-2">
        {tabs.map(({ label, icon: Icon }) => (
            <button
            key={label}
            onClick={() => setActiveTab(label)}
            className={`flex items-center gap-2 text-sm font-medium pb-1 border-b-2 transition-all duration-300 ${
                activeTab === label
                ? "text-blue-600 border-blue-600"
                : "text-gray-500 border-transparent hover:text-blue-500"
            }`}>
                <Icon className="w-4 h-4" />
                {label}
                </button>
            ))}
            </div>

      {/* Table */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-800">Your Classes</h3>
          <button className="text-blue-600 text-sm hover:underline">View All</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-gray-500 border-b">
              <tr>
                <th className="py-2 text-left">Subject</th>
                <th className="py-2 text-left">Tutors</th>
                <th className="py-2 text-left">Status</th>
                <th className="py-2 text-left">Submission</th>
                <th className="py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {classData.map((cls, index) => {
                // const formattedSubject = cls.subject.toLowerCase().replace(/\s+/g, "-");
                const formattedSubject = encodeURIComponent(cls.subject.toLowerCase().replace(/\s+/g, "-")
              );
                
                return (
                <tr key={index} className="border-b">
                  <td className="py-3">{cls.subject}</td>
                  <td className="flex items-center gap-2 py-3">
                    <img
                    src={cls.profilePic}
                    alt={cls.teacher}
                    className="w-8 h-8 rounded-full object-cover border"/>
                    <Link
                    href={`/lms-home/student/tutor/${encodeURIComponent(
                      cls.teacher.toLowerCase().replace(/\s+/g, "-")
                    )}`}
                    className="text-blue-600 hover:underline">
                      {cls.teacher}
                      </Link>
                      </td>
                      
                  <td>
                    <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      cls.status === "Submitted"
                      ? "bg-green-100 text-green-600"
                      : cls.status === "Pending"
                      ? "bg-orange-100 text-orange-600"
                      : "bg-blue-100 text-blue-600"
                    }`}
                    >
                      {cls.status}
                      </span>
                      </td>
                      <td>{cls.date}</td>
                      <td className="relative">
                        <button
                        onClick={() =>
                          setOpenDropdownIndex(openDropdownIndex === index ? null : index)
                        }
                        className="p-1 hover:bg-gray-100 rounded-full">
                          <MoreHorizontal className="w-5 h-5 text-gray-600" />
                          </button>
                          
                          {openDropdownIndex === index && (
                            <div ref={openDropdownIndex === index ? dropdownRef : null} 
                            className="absolute right-0 mt-2 w-56 bg-white shadow-md rounded-md z-10 border text-sm">
                              <ul className="py-1">
                                <li>
                                  <Link href={`/lms-home/student/scheduling/${formattedSubject}/attempt`}>
                                  <div className="px-4 py-2 hover:bg-blue-50 cursor-pointer">
                                    Assessment
                                    </div>
                                    </Link>
                                    </li>
                                    
                                    <li>
                                      <Link href={`/lms-home/student/scheduling/${formattedSubject}/submit`}>
                                      <div className="px-4 py-2 hover:bg-blue-50 cursor-pointer">
                                        Submit Assignment
                                        </div>
                                        </Link>
                                        </li>
                                        
                                        <li>
                                          <Link href={`/lms-home/student/scheduling/${formattedSubject}/resources`}>
                                          <div className="px-4 py-2 hover:bg-blue-50 cursor-pointer">
                                            Resources & Material
                                            </div>
                                            </Link>
                                            </li>
                                            </ul>
                                            </div>
                                          )}
                                          </td>
                                          </tr>
                                          );
                                          })}
                                          </tbody>
                                          </table>
                                          </div>
                                          </div>
                                        </div>
                                        );
                                      }
