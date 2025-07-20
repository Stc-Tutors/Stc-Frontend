"use client";

import { useState } from "react";
import { Circle } from "rc-progress";

export default function LessonProgress() {
  const progress = 90;

  const announcements = [
    "Mathematics class rescheduled for Friday.",
    "Upload your weekly lesson plan.",
    "Check curriculum update for Grade 10.",
  ];

  const [expanded, setExpanded] = useState(false);
  const visibleAnnouncements = expanded ? announcements : announcements.slice(0, 1);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
      {/* Title */}
      <div>
        <h3 className="font-semibold text-gray-800">Lesson</h3>
        <p className="text-sm text-gray-500">This Semester</p>
      </div>

      {/* Donut Progress */}
      <div className="flex justify-center items-center">
        <div className="relative w-[120px] h-[120px]">
          <Circle
            percent={progress}
            strokeWidth={8}
            trailWidth={8}
            strokeColor="#3b82f6"
            trailColor="#e5e7eb"
          />
          <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-800">
            {progress}%
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 text-sm">
        <div className="flex items-center gap-1 text-blue-500">
          <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span> English
        </div>
        <div className="flex items-center gap-1 text-orange-500">
          <span className="w-3 h-3 rounded-full bg-orange-500 inline-block"></span> Mathematics
        </div>
        <div className="flex items-center gap-1 text-sky-400">
          <span className="w-3 h-3 rounded-full bg-sky-400 inline-block"></span> Biology
        </div>
      </div>

      {/* Announcement */}
      <div className="border-t pt-3 mt-2">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-semibold text-gray-800 text-sm">Announcement</h4>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-blue-500 hover:underline"
          >
            {expanded ? "Hide" : "View all"}
          </button>
        </div>
        <ul className="space-y-1 text-sm text-gray-600">
          {visibleAnnouncements.map((item, i) => (
            <li key={i} className="border-b pb-1 last:border-none">{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
