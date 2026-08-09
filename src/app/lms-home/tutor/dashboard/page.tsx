"use client";

import TutorsCard from "@/components/tutorDashboard/TutorsCard";
import PerformanceChart from "@/components/tutorDashboard/PerformanceChart";
import CalendarPreview from "@/components/tutorDashboard/CalendarPreview";
import TodaysSessions from "@/components/tutorDashboard/TodaysSessions";
import LessonProgress from "@/components/tutorDashboard/LessonProgress";
import YourStudent from "@/components/tutorDashboard/YourStudent";
import UpcomingEventsWidget from "@/components/shared/UpcomingEventsWidget";
import { useUser } from "@/contexts/user-context";
import TutorProfileIncompleteBanner from "@/components/tutor-profile-incomplete-banner";

export default function TutorDashboardPage() {
  const { user } = useUser();

  return (
  <div className="space-y-6">
    <TutorProfileIncompleteBanner />

    {/* Welcome Section */}
    <section className="bg-[#38b6ff] p-6 rounded-lg shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex-1">
        <h2 className="text-xl font-bold text-white">Welcome to your dashboard{user ? `, ${user.firstName}` : ""}!</h2>
        <p className="text-lg text-white mt-8">
          Here's where your virtual classroom comes to life.
          Manage your lessons, track student progress, and stay organized, all in one place.
          Whether you are scheduling a new class, reviewing assignments or
          chatting with students, your dashboard is built to make online teaching smooth
          and effective.
        </p>
      </div>
    </section>

    {/* Cards Section */}
    <TutorsCard />

    <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <PerformanceChart />
      <CalendarPreview />
      <TodaysSessions />
      <LessonProgress />
      <UpcomingEventsWidget />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-1 gap-4">
          <YourStudent />
          </section>
  </div>
)};
