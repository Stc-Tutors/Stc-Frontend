"use client";
import React from "react";

interface Lesson {
  subject: string;
  platform: string;
  color: string; // Tailwind color class
}

const timetable = [
  {
    time: "09:00 - 10:30",
    days: {
      Mon: { subject: "Mathematics", platform: "Google Meet", color: "bg-blue-100 text-blue-600 border-l-4 border-blue-400" },
      Tue: { subject: "Mathematics", platform: "Google Meet", color: "bg-blue-100 text-blue-600 border-l-4 border-blue-400" },
      Wed: null,
      Thu: { subject: "Mathematics", platform: "Google Meet", color: "bg-red-100 text-red-600 border-l-4 border-red-400" },
    },
  },
  {
    time: "09:00 - 10:30",
    days: {
      Mon: { subject: "Mathematics", platform: "Google Meet", color: "bg-green-100 text-green-600 border-l-4 border-green-400" },
      Tue: null,
      Wed: { subject: "Mathematics", platform: "Google Meet", color: "bg-yellow-100 text-yellow-600 border-l-4 border-yellow-400" },
      Thu: { subject: "Mathematics", platform: "Google Meet", color: "bg-blue-100 text-blue-600 border-l-4 border-blue-400" },
    },
  },
  {
    time: "09:00 - 10:30",
    days: {
      Mon: { subject: "Mathematics", platform: "Google Meet", color: "bg-yellow-100 text-yellow-600 border-l-4 border-yellow-400" },
      Tue: { subject: "Mathematics", platform: "Google Meet", color: "bg-red-100 text-red-600 border-l-4 border-red-400" },
      Wed: null,
      Thu: null,
    },
  },
];

export default function Timetable() {
  const days = ["Mon", "Tue", "Wed", "Thu"];

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold text-gray-800 mb-4">Time Table</h3>
      <div className="grid grid-cols-[120px_repeat(4,1fr)] gap-4">
        {/* Header Row */}
        <div className="font-medium text-gray-500">Time</div>
        {days.map((day) => (
          <div key={day} className="font-medium text-gray-500 text-center">{day}</div>
        ))}

        {/* Rows */}
        {timetable.map((row, i) => (
          <React.Fragment key={i}>
            {/* Time column */}
            <div className="text-gray-600">{row.time}</div>
            {/* Day columns */}
            {days.map((day) => {
              const lesson = row.days[day as keyof typeof row.days];
              return (
                <div key={day}>
                  {lesson ? (
                    <div
                      className={`${lesson.color} p-2 rounded-md text-sm`}
                    >
                      <p className="font-medium">{lesson.subject}</p>
                      <p className="text-xs text-gray-500">{lesson.platform}</p>
                    </div>
                  ) : (
                    <div className="h-12"></div>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
