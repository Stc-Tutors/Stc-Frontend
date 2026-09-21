"use client";

import WidgetBoundary from "@/components/shared/WidgetBoundary";
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
      <WidgetBoundary name="the child summary">
        <ParentHeader  />
      </WidgetBoundary>

      {/* Cards Section */}
        <WidgetBoundary name="the summary cards">
          <CardsSection showChildrenCount  />
        </WidgetBoundary>
        
        {/* Performance Overview + Calendar + Notifications + Help */}
        <WidgetBoundary name="the performance overview">
          <ParentMiddleSection />
        </WidgetBoundary>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <WidgetBoundary name="upcoming events">
              <UpcomingEventsWidget  />
            </WidgetBoundary>
            </section>

        <section className="grid grid-cols-1 lg:grid-cols-1 gap-4">
            <WidgetBoundary name="the timetable">
              <Timetable  />
            </WidgetBoundary>
            </section>
    </div>
  );
}
