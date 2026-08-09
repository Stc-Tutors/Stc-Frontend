"use client";

import { useState } from "react";
import AcademicPerformanceReport from "@/components/parentDashboard/AcademicPerformanceReport";
import AttendanceRecord from "@/components/parentDashboard/AttendanceRecord";
import ParentAnalyticsHeader from "@/components/parentDashboard/ParentAnalyticsHeader";
import RecentAttendance from "@/components/parentDashboard/RecentAttendance";
import CardsSection from "@/components/studentDashboard/CardsSection";

export default function ParentAnalyticsPage() {
  const [selectedStudentId, setSelectedStudentId] = useState<string | undefined>(undefined);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <ParentAnalyticsHeader onStudentChange={setSelectedStudentId} />

      {/* Cards Section */}
      <CardsSection />

      {/*Academic Performance*/}
      <AcademicPerformanceReport studentId={selectedStudentId} />

      {/*Attendance Record*/}
      <AttendanceRecord studentId={selectedStudentId} />

      {/*Recent Attendance*/}
      <RecentAttendance studentId={selectedStudentId} />
    </div>
  );
}
