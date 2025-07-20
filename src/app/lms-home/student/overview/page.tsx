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
import CardsSection from "@/components/studentDashboard/CardsSection";
import PerformanceChart from "@/components/studentDashboard/PerformanceChart";
import CalendarPreview from "@/components/studentDashboard/CalendarPreview";
import TodayLectures from "@/components/studentDashboard/TodayLecture";
import LessonProgress from "@/components/studentDashboard/LessonProgress";
import YourClasses from "@/components/studentDashboard/YourClasses";

export default function StudentOverviewPage() {
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
      <LessonProgress />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-1 gap-4">
          <YourClasses />
          </section>
  </div>
)};
