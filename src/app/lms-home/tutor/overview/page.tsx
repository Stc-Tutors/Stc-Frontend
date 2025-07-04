"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CalendarDays } from "lucide-react";
import {motion} from "framer-motion";
import CardsSection from "@/components/tutorDashboard/CardsSection";
import PerformanceChart from "@/components/tutorDashboard/PerformanceChart";
import CalendarPreview from "@/components/tutorDashboard/CalendarPreview";
import TodayLectures from "@/components/tutorDashboard/TodayLecture";


export default function TutorOverviewPage() {
  const [chartData, setChartData] = useState([
    { name: "Mon", students: 5 },
    { name: "Tue", students: 8 },
    { name: "Wed", students: 6 },
    { name: "Thu", students: 10 },
    { name: "Fri", students: 4 },
  ]);

  return (
  <div className="space-y-6">
    {/* Welcome Section */}
    <section className="bg-[#38b6ff] p-6 rounded-lg shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex-1">
        <h2 className="text-xl font-bold text-white">Welcome back, SC Tutors 👋</h2>
        <p className="text-lg text-white mt-1">
          Here, you can easily view your upcoming classes, track your progress, 
          revisit previous lessons, and stay up to date with new assignments. 
          Whether you are catching up or pushing ahead, everything you need for a successful 
          learning experience is right at your fingertips.
        </p>
      </div>

      {/* Right image */}
      <div className="w-full md:w-1/3">
        <motion.img
        src="/image/header.svg"
        alt="Welcome illustration"
        className="w-full h-auto object-contain"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        />
      </div>
    </section>

    {/* Cards Section */}
    <CardsSection />

    <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <PerformanceChart />
      
      <CalendarPreview />
      <TodayLectures />

        </section>
    {/* Classes Table + Calendar */}
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Your Classes */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-2">Your Classes</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="pb-2">Course</th>
              <th className="pb-2">Day</th>
              <th className="pb-2">Time</th>
            </tr>
          </thead>
          <tbody>
            {[
              { course: "Physics - Grade 10", day: "Tuesday", time: "2:00 PM" },
              { course: "Chemistry - Grade 11", day: "Thursday", time: "11:00 AM" },
            ].map((cls, i) => (
              <tr key={i} className="border-b">
                <td className="py-2">{cls.course}</td>
                <td>{cls.day}</td>
                <td>{cls.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      

    </section>
  </div>
)};
