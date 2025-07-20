import {
  PlayCircle,
  CheckSquare,
  Trophy,
  Users,
} from "lucide-react";

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
  {
    title: "Course Instructors",
    value: 14,
    icon: Users,
    iconColor: "text-orange-500",
    bgColor: "bg-orange-100",
  },
];

export default function CardsSection() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ title, value, icon: Icon, iconColor, bgColor }) => (
        <div
          key={title}
          className={`flex items-center gap-4 p-4 rounded-lg ${bgColor}`}
        >
          <div className="bg-white rounded-md p-3">
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
          <div>
            <p className="text-2xl font-semibold text-gray-800">{value.toLocaleString()}</p>
            <p className="text-sm text-gray-600">{title}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
