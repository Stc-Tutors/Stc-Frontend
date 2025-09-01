"use client";
export default function PerformanceCard({ title }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow text-center transition-transform duration-200 hover:scale-105">
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm text-gray-500">This Semester</p>
      <div className="flex justify-center my-4">
        <div className="relative w-20 h-20">
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <path
              className="text-gray-200"
              d="M18 2.0845
                 a 15.9155 15.9155 0 0 1 0 31.831
                 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="text-blue-500"
              d="M18 2.0845
                 a 15.9155 15.9155 0 0 1 0 31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray="90, 100"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">
            90%
          </span>
        </div>
      </div>
      <div className="flex justify-center gap-2 text-xs text-gray-600">
        <span className="text-blue-500">●</span> English
        <span className="text-yellow-500">●</span> Mathematics
        <span className="text-green-500">●</span> Biology
      </div>
    </div>
  );
}
