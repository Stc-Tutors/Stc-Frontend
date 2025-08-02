import { FileText } from "lucide-react";

export default function ExamCard({
  title,
  type,
  date,
  day,
  time,
  location,
}: {
  title: string;
  type: string;
  date: string;
  day: string;
  time: string;
  location: string;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b">
      <div className="flex items-center gap-4">
        <FileText className="text-blue-500" />
        <div>
          <p className="font-semibold">{title}</p>
          <p className="text-xs text-gray-500">{type}</p>
        </div>
      </div>
      <div className="text-sm text-gray-600 w-1/3 text-center">
        <p>{date}</p>
        <p className="text-xs text-gray-400">{day}</p>
      </div>
      <div className="text-sm text-gray-600 w-1/4 text-center">{time}</div>
      <div className="text-sm text-gray-600 w-1/4 text-right">{location}</div>
    </div>
  );
}
