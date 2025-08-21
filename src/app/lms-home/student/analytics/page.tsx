import { PlayCircle, CheckSquare, Trophy } from "lucide-react";
import DownloadReport from "@/components/studentDashboard/DownloadReport";
import AnalyticsChart from "@/components/studentDashboard/AnalyticsChart";
import { Card } from "@/components/ui/card";

const cards = [
  {
    title: "Enrolled Courses",
    value: 1957,
    icon: PlayCircle,
    iconColor: "text-blue-500",
    bgColor: "bg-blue-100",
  },
  {
    title: "Active Courses",
    value: 1957,
    icon: CheckSquare,
    iconColor: "text-purple-500",
    bgColor: "bg-purple-100",
  },
  {
    title: "Completed Courses",
    value: 112,
    icon: Trophy,
    iconColor: "text-green-500",
    bgColor: "bg-green-100",
  },
];

export default function AnalyticsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <h2 className="text-2xl font-semibold text-gray-800">Analytics</h2>

      {/* All 4 cards in one row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ title, value, icon: Icon, iconColor, bgColor }) => (
          <div
            key={title}
            className={`flex items-center gap-4 p-4 rounded-lg shadow ${bgColor}`}
          >
            <div className="bg-white rounded-md p-3">
              <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-800">
                {value.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">{title}</p>
            </div>
          </div>
        ))}

        {/* Attendance Report Card */}
        <DownloadReport />
      </div>
      {/* ====== MIDDLE SECTION: Chart + Announcement ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart takes 2/3 width */}
        <div className="lg:col-span-2">
          <AnalyticsChart />
        </div>

        {/* Announcement panel */}
        <Card className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-800">Announcement</h3>
            <button className="text-sm text-blue-600 hover:underline">View all</button>
          </div>

          <div className="space-y-4">
            {[
              {
                day: "Wed",
                date: "12",
                subject: "Mathematics",
                text: "A new workshop on Algebraic Expressions has been uploaded. Please complete before Friday, June 27.",
              },
              {
                day: "Wed",
                date: "12",
                subject: "English",
                text: "This week's focus is persuasive writing techniques. Be sure to read the assigned material.",
              },
              {
                day: "Wed",
                date: "12",
                subject: "Physics",
                text: "Your Forces and Motion quiz is scheduled for Thursday, June 20 at 2:00 PM.",
              },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-3">
                {/* Date block */}
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-500">{item.day}</p>
                  <p className="text-lg font-bold text-gray-800">{item.date}</p>
                </div>

                {/* Content */}
                <div>
                  <p className="font-semibold text-gray-800">{item.subject}</p>
                  <p className="text-sm text-gray-600">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ====== BOTTOM SECTION: Circular Progress Cards ====== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Lessons", color: "text-blue-500" },
          { title: "Attendance Record", color: "text-orange-500" },
          { title: "Test Performance", color: "text-purple-500" },
          { title: "Assignment Completion", color: "text-green-500" },
        ].map((card, idx) => (
          <Card key={idx} className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center">
            <p className="font-semibold text-gray-800">{card.title}</p>
            <p className="text-sm text-gray-500 mb-2">This Semester</p>

            {/* Circle Progress Placeholder */}
            <div className="relative w-20 h-20 flex items-center justify-center mb-2">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="36%"
                  stroke="#e5e7eb"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="36%"
                  stroke="currentColor"
                  className={card.color}
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 36}%`}
                  strokeDashoffset={`${2 * Math.PI * 36 * (1 - 0.9)}%`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-lg font-semibold text-gray-800">90%</span>
            </div>

            {/* Legend */}
            <div className="flex gap-2 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> English
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span> Mathematics
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span> Biology
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}