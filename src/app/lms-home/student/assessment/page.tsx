"use client";

import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, CalendarDays } from "lucide-react";
import ExamCard from "@/components/studentDashboard/ExamCard";
import { Button } from "@/components/ui/button";

export default function ExamPage() {
  const router = useRouter();
  const { subject } = useParams();

  const handleBack = () => {
    router.push(`/lms-home/student/scheduling`);
  };

  return (
    <div className="min-h-screen bg-white px-6 py-4">
      {/* Back nav */}
      <button
        onClick={handleBack}
        className="flex items-center text-gray-700 mb-4 cursor-pointer hover:text-blue-500"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        <span>Assessment</span>
      </button>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <CalendarDays className="text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-800">Assessment</h2>
        </div>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white">Assessment Calendar</Button>
      </div>

      {/* Table Head */}
      <div className="grid grid-cols-4 font-semibold text-sm text-gray-600 py-2 border-b">
        <div>Subject</div>
        <div className="text-center">Date</div>
        <div className="text-center">Time</div>
        <div className="text-right">Location</div>
      </div>

      {/* Exam List */}
      <div className="divide-y">
        <ExamCard
          title="Mathematics Formular Sheet"
          type="Mid-term Assessment"
          date="30 May 2025"
          day="Tuesday"
          time="09:00 - 10:00"
          location="Google Meet"
        />
        <ExamCard
          title="Mathematics Formular Sheet"
          type="Mid-term Assessment"
          date="30 May 2025"
          day="Tuesday"
          time="09:00 - 10:00"
          location="Google Meet"
        />
        <ExamCard
          title="Mathematics Formular Sheet"
          type="Mid-term Assessment"
          date="30 May 2025"
          day="Tuesday"
          time="09:00 - 10:00"
          location="Google Meet"
        />
        <ExamCard
          title="Mathematics Formular Sheet"
          type="Mid-term Assessment"
          date="30 May 2025"
          day="Tuesday"
          time="09:00 - 10:00"
          location="Google Meet"
        />
        <ExamCard
          title="Mathematics Formular Sheet"
          type="Mid-term Assessment"
          date="30 May 2025"
          day="Tuesday"
          time="09:00 - 10:00"
          location="Google Meet"
        />
        <ExamCard
          title="Mathematics Formular Sheet"
          type="Mid-term Assessment"
          date="30 May 2025"
          day="Tuesday"
          time="09:00 - 10:00"
          location="Google Meet"
        />
        <ExamCard
          title="Mathematics Formular Sheet"
          type="Mid-term Assessment"
          date="30 May 2025"
          day="Tuesday"
          time="09:00 - 10:00"
          location="Google Meet"
        />
        <ExamCard
          title="Mathematics Formular Sheet"
          type="Mid-term Assessment"
          date="30 May 2025"
          day="Tuesday"
          time="09:00 - 10:00"
          location="Google Meet"
        />
      </div>
    </div>
  );
}
