"use client";

import {
  CircularProgressbar,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

export default function LessonProgress() {
  const percentage = 68; // Dummy data — you can replace with real data later

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm text-center">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Lesson Progress</h3>

      <div className="w-32 h-32 mx-auto">
        <CircularProgressbar
          value={percentage}
          text={`${percentage}%`}
          styles={buildStyles({
            textColor: "#1e3a8a",
            pathColor: "#3b82f6",
            trailColor: "#e5e7eb",
            textSize: "16px",
            strokeLinecap: "round",
          })}
        />
      </div>

      <p className="mt-4 text-sm text-gray-600">
        You're making great progress. Keep it up! 💪
      </p>
    </div>
  );
}
