"use client";

import { useState } from "react";
import TutorsCard from "@/components/tutorDashboard/TutorsCard";
import PerformanceChart from "@/components/studentDashboard/PerformanceChart";
import CalendarPreview from "@/components/studentDashboard/CalendarPreview";
import TodayLectures from "@/components/studentDashboard/TodayLecture";
import LessonProgress from "@/components/studentDashboard/LessonProgress";
import YourStudent from "@/components/tutorDashboard/YourStudent";

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
        <h2 className="text-xl font-bold text-white">Welcome to your dashboard, John!</h2>
        <p className="text-lg text-white mt-8">
          Here's where your virtual classroom comes to life.
          Manage your lessons, track student progress, and stay organized, all in one place.
          Whether you are scheduling a new class, reviewing assignments or
          chatting with students, your dashboard is built to make online teaching smooth
          and effective.
        </p>
      </div>

      {/* Right image
      <div className="w-full md:w-1/3">
        <motion.img
        src="/image/header.svg"
        alt="Welcome illustration"
        className="w-full h-auto object-contain"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        />
      </div> */}
    </section>

    {/* Cards Section */}
    <TutorsCard />

    <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <PerformanceChart />     
      <CalendarPreview />
      <TodayLectures />
      <LessonProgress />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-1 gap-4">
          <YourStudent />
          </section>
  </div>
)};
