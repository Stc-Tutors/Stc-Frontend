"use client";

import {motion} from "framer-motion";
import CardsSection from "@/components/studentDashboard/CardsSection";
import PerformanceChart from "@/components/studentDashboard/PerformanceChart";
import CalendarPreview from "@/components/studentDashboard/CalendarPreview";
import TodayLectureCard from "@/components/studentDashboard/TodayLectureCard";
import Timetable from "@/components/studentDashboard/TimeTable";
import UpcomingEventsWidget from "@/components/shared/UpcomingEventsWidget";
import { useUser } from "@/contexts/user-context";
import PendingEnrollmentBanner from "@/components/pending-enrollment-banner";

export default function StudentOverviewPage() {
  const { user } = useUser();

  return (
  <div className="space-y-6">
    <PendingEnrollmentBanner basePath="/lms-home/student/complete-profile" source="mine" />

    {/* Welcome Section */}
    <section className="bg-[#38b6ff] p-6 rounded-lg shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex-1">
        <h2 className="text-xl font-bold text-white">Welcome back{user ? `, ${user.firstName}` : ""} 👋</h2>
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
      <UpcomingEventsWidget />
        </section>

        <section className="grid grid-cols-1 gap-4">
          <TodayLectureCard />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-1 gap-4">
          <Timetable />
          </section>
  </div>
)};
