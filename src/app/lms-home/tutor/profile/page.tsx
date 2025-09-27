"use client";
import CourseHeader from "@/components/tutorDashboard/CourseHeader";
import CourseRatingCard from "@/components/tutorDashboard/CourseRating";
import TutorsCard from "@/components/tutorDashboard/TutorsCard";;
import RevenueChart from "@/components/tutorDashboard/RevenueCharts";
import CourseOverviewChart from "@/components/tutorDashboard/CourseOverview";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function InstructorDashboard() {
    
    const router = useRouter();

    const handleBack = () => {
    router.push(`/lms-home/tutor/dashboard`);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        
        {/**************************BACK**************************/}
      <button
        onClick={handleBack}
        className="flex items-center text-1xl-gray-700 mb-4 cursor-pointer hover:text-blue-500">
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="text-1xl font-bold">BACK</span>
      </button>

      {/* Top section – course header */}
      <CourseHeader />

      {/* Stats cards */}
      <TutorsCard />

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left big card */}
        <CourseRatingCard/>
        {/* Right graphs */}
        <div className="lg:col-span-2 space-y-6">
          <RevenueChart />
          <CourseOverviewChart />
        </div>
      </div>
    </div>
  );
}
