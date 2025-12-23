"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

export default function ParentCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Number of days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Starting day (0 = Sunday)
  const startDay = new Date(year, month, 1).getDay();

  // Get today for highlighting
  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month;

  const handlePrevMonth = () =>
    setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () =>
    setCurrentDate(new Date(year, month + 1, 1));

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="text-blue-500" />
          <CardTitle>
            {monthNames[month]} {year}
          </CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded hover:bg-gray-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1 rounded hover:bg-gray-200"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium">
          {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
            <div key={d} className="text-gray-500 py-2">
              {d}
            </div>
          ))}

          {/* Empty spaces before 1st day */}
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {/* Actual days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isToday = isCurrentMonth && day === today.getDate();

            return (
              <div
                key={day}
                className={`py-2 rounded-lg cursor-pointer transition-all ${
                  isToday
                    ? "bg-blue-600 text-white font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {day}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
