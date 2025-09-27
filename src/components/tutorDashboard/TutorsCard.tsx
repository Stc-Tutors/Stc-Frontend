import {
  PlayCircle,
  CheckSquare,
  Trophy,
  Users,
  ClipboardList,
  Clock3,
  MessageCircleMore,
  FileCheck,
  TrophyIcon,
  Shapes,
} from "lucide-react";

const cards = [
  {
    title: "Lecture (219.3GB)",
    value: 1957,
    icon: PlayCircle,
    iconColor: "text-orange-500",
    bgColor: "bg-orange-100",
  },
  {
    title: "Enrolled Students",
    value: 1957,
    icon: Users,
    iconColor: "text-pink-500",
    bgColor: "bg-pink-100",
  },
  {
    title: "Course Language",
    value: "English",
    icon: ClipboardList,
    iconColor: "text-gray-900",
    bgColor: "bg-gray-100",
  },
  {
    title: "Hours",
    value: "19:37:51",
    icon: Clock3,
    iconColor: "text-purple-500",
    bgColor: "bg-purple-100",
  },
  
  {
    title: "Notifications",
    value: 1957,
    icon: MessageCircleMore,
    iconColor: "text-purple-500",
    bgColor: "bg-purple-100",
  },
  {
    title: "Course level",
    value: "Beginner",
    icon: Shapes,
    iconColor: "text-green-500",
    bgColor: "bg-green-100",
  },
  {
    title: "Attached File",
    value: 142,
    icon: FileCheck,
    iconColor: "text-orange-500",
    bgColor: "bg-orange-100",
  },
  {
    title: "Finished course",
    value: "19:37:51",
    icon: TrophyIcon,
    iconColor: "text-gray-900",
    bgColor: "bg-gray-100",
  },
];

export default function CardsSection() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ title, value, icon: Icon, iconColor, bgColor }) => (
        <div
          key={title}
          className={"flex items-center gap-4 p-4 rounded-lg bg-white shadow-sm"}
        >
          <div className={`rounded-md p-3 ${bgColor}`}>
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
