"use client";

import { Button } from "@/components/ui/button";
import { Settings, MessageSquare, CalendarDays } from "lucide-react";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function ParentAnalyticsHeader() {
  const [selectedStudent, setSelectedStudent] = useState("Emmanuel Jobe");

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      {/* Top Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left: Title and Subtitle */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Performance Monitoring</h2>
          <p className="text-gray-500 text-sm">
            Manage your student’s academic reports, payment records, and billing information for all your students.
          </p>
        </div>

        {/* Right: Buttons */}
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2 border-blue-500 text-blue-600 hover:bg-blue-50">
            <MessageSquare size={16} />
            Message Admin
          </Button>
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <CalendarDays size={16} />
            Schedule Session
          </Button>
        </div>
      </div>

      {/* Student + Track Row */}
      <div className="mt-6 flex flex-wrap items-center gap-4">
        {/* Dropdown for Student */}
        <div className="relative">
          <button className="flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg min-w-[180px] text-gray-700 bg-white hover:bg-gray-50">
            {selectedStudent}
            <ChevronDown size={16} className="ml-2 text-gray-500" />
          </button>
        </div>

        {/* Grade and Track */}
        <p className="text-gray-600 text-sm">
          Grade 9 <span className="mx-2 text-gray-400">•</span> Science Track
        </p>
      </div>
    </div>
  );
}
