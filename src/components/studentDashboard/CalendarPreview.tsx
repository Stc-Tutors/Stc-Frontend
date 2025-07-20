"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function CalendarPreview() {
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const today = new Date();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const totalDays = lastDayOfMonth.getDate();
  const startDay = firstDayOfMonth.getDay();

  const dates = Array.from({ length: startDay + totalDays }, (_, index) => {
    const date = index - startDay + 1;
    return date > 0 ? new Date(year, month, date) : null;
  });

  const isToday = (date: Date) =>
    date.toDateString() === today.toDateString();

  const isSelected = (date: Date) =>
    selectedDate && date.toDateString() === selectedDate.toDateString();

  const handleMonthChange = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

//   useEffect(() => {
//   if (selectedDate) {
//     // fetch lessons from backend
//     // fetch(/api/lessons?date=${selectedDate.toISOString()})
//   }
// }, [selectedDate]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {currentDate.toLocaleString("default", { month: "long" })} {year}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => handleMonthChange(-1)}
            className="p-1.5 rounded hover:bg-gray-100 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleMonthChange(1)}
            className="p-1.5 rounded hover:bg-gray-100 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Days header */}
      <div className="grid grid-cols-7 text-xs text-gray-400 mb-2">
        {days.map((d) => (
          <div key={d} className="text-center font-medium">
            {d}
          </div>
        ))}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-7 gap-y-2 text-sm">
        {dates.map((dateObj, idx) => (
          <div key={idx} className="flex items-center justify-center h-8">
            {dateObj ? (
              <div
                onClick={() => setSelectedDate(dateObj)}
                className={`w-7 h-7 flex items-center justify-center rounded-full cursor-pointer transition
                  ${
                    isSelected(dateObj)
                      ? "bg-blue-500 text-white"
                      : isToday(dateObj)
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-800 hover:bg-gray-100"
                  }`}
              >
                {dateObj.getDate()}
              </div>
            ) : (
              <div className="w-7 h-7" /> // Empty slot
            )}
          </div>
        ))}
      </div>

      {/* Selected Date Preview */}
      {selectedDate && (
        <p className="mt-4 text-sm text-gray-600">
          Selected:{" "}
          <span className="font-medium">{selectedDate.toDateString()}</span>
        </p>
      )}
    </div>
  );
}