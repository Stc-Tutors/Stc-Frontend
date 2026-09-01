"use client";

import ParentHeader from "@/components/parentDashboard/ParentHeader";
import ParentMiddleSection from "@/components/parentDashboard/ParentMiddleSection";
import CardsSection from "@/components/studentDashboard/CardsSection";
import Timetable from "@/components/studentDashboard/TimeTable";
import TodayLectures from "@/components/studentDashboard/TodayLecture";
import UpcomingEventsWidget from "@/components/shared/UpcomingEventsWidget";
import PendingEnrollmentBanner from "@/components/pending-enrollment-banner";
import IncompleteEnrollmentBanner from "@/components/incomplete-enrollment-banner";

export default function ParentDashboardPage() {
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <PendingEnrollmentBanner basePath="/lms-home/parent/complete-profile" source="linked" />
      <IncompleteEnrollmentBanner basePath="/lms-home/parent/enrollment" source="linked" />

      {/* Header */}
      <ParentHeader />

      {/* Cards Section */}
        <CardsSection />
        
        {/* Performance Overview + Calendar + Notifications + Help */}
        <ParentMiddleSection/>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <UpcomingEventsWidget />
            </section>

        <section className="grid grid-cols-1 lg:grid-cols-1 gap-4">
            <Timetable />
            </section>
    </div>
  );
}
