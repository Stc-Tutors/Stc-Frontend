"use client";
import Image from "next/image";
import HeaderBanner from "../components/HeaderBanner";
import InfoCard from "../components/InfoCard";
import PerformanceCard from "../components/PerformanceCard";
import AnnouncementCard from "../components/AnnouncementCard";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 p-6 space-y-6">
      {/* ✅ Top Banner */}
      <HeaderBanner />

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <InfoCard title="Student Information" />
        <InfoCard title="Parent Information" />
      </div>

      {/* Performance + Announcement */}
      <div className="grid gap-4 md:grid-cols-3">
        <PerformanceCard title="Course Performance" />
        <PerformanceCard title="Attendance Record" />
        <AnnouncementCard />

        <PerformanceCard title="Test Performance" />
        <PerformanceCard title="Assignment Completion" />
      </div>
    </main>
  );
}
