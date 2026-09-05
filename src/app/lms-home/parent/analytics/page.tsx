"use client";

import { useState } from "react";
import AcademicPerformanceReport from "@/components/parentDashboard/AcademicPerformanceReport";
import AssignmentsOverviewPanel from "@/components/parentDashboard/AssignmentsOverviewPanel";
import AttendanceRecord from "@/components/parentDashboard/AttendanceRecord";
import AttendanceTrendChart from "@/components/parentDashboard/AttendanceTrendChart";
import BillingSummaryPanel from "@/components/parentDashboard/BillingSummaryPanel";
import CourseProgressChart from "@/components/parentDashboard/CourseProgressChart";
import ParentAnalyticsHeader from "@/components/parentDashboard/ParentAnalyticsHeader";
import RecentAttendance from "@/components/parentDashboard/RecentAttendance";
import TutorRatingsPanel from "@/components/parentDashboard/TutorRatingsPanel";
import CardsSection from "@/components/studentDashboard/CardsSection";

export default function ParentAnalyticsPage() {
  const [selectedStudentId, setSelectedStudentId] = useState<string | undefined>(undefined);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <ParentAnalyticsHeader onStudentChange={setSelectedStudentId} />

      {/* Cards Section */}
      <CardsSection />

      {/* Assignment completion overview */}
      <AssignmentsOverviewPanel studentId={selectedStudentId} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/*Academic Performance*/}
        <AcademicPerformanceReport studentId={selectedStudentId} />

        {/*Course Progress*/}
        <CourseProgressChart studentId={selectedStudentId} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/*Attendance Record*/}
        <AttendanceRecord studentId={selectedStudentId} />

        {/*Attendance Trend*/}
        <AttendanceTrendChart studentId={selectedStudentId} />
      </div>

      {/*Recent Attendance*/}
      <RecentAttendance studentId={selectedStudentId} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/*Tutor Ratings*/}
        <TutorRatingsPanel studentId={selectedStudentId} />

        {/*Billing & Spending*/}
        <BillingSummaryPanel studentId={selectedStudentId} />
      </div>
    </div>
  );
}
