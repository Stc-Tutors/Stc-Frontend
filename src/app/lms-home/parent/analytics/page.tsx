"use client";

import AcademicPerformanceReport from "@/components/parentDashboard/AcademicPerformanceReport";
import AttendanceRecord from "@/components/parentDashboard/AttendanceRecord";
import ParentAnalyticsHeader from "@/components/parentDashboard/ParentAnalyticsHeader";
import RecentAttendance from "@/components/parentDashboard/RecentAttendance";
import CardsSection from "@/components/studentDashboard/CardsSection";
export default function ParentAnalyticsPage() {
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <ParentAnalyticsHeader />

      {/* Cards Section */}
      <CardsSection />

      {/*Academic Performance*/}
      <AcademicPerformanceReport/>

      {/*Attendance Record*/}
      <AttendanceRecord/>

      {/*Recent Attendance*/}
      <RecentAttendance/>
    </div>
  );
}
