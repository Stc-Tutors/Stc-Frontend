"use client";

import ParentHeader from "@/components/parentDashboard/ParentHeader";
import ParentMiddleSection from "@/components/parentDashboard/ParentMiddleSection";
import CardsSection from "@/components/studentDashboard/CardsSection";
import Timetable from "@/components/studentDashboard/TimeTable";
import TodayLectures from "@/components/studentDashboard/TodayLecture";

export default function ParentDashboardPage() {
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <ParentHeader />

      {/* Cards Section */}
        <CardsSection />
        
        {/* Performance Overview + Calendar + Notifications + Help */}
        <ParentMiddleSection/>
        
        <section className="grid grid-cols-1 lg:grid-cols-1 gap-4">
            <Timetable />
            </section>
    </div>
  );
}
