"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AttendanceRecord {
  date: string;
  subject: string;
  tutor: string;
  status: "Present" | "Absent" | "Late";
}

const recentAttendance: AttendanceRecord[] = [
  {
    date: "2025-06-01 10:30",
    subject: "Mathematics",
    tutor: "Mr. Richard",
    status: "Present",
  },
  {
    date: "2025-06-02 09:15",
    subject: "Physics",
    tutor: "Ms. Adams",
    status: "Absent",
  },
  {
    date: "2025-06-03 11:00",
    subject: "English",
    tutor: "Mrs. White",
    status: "Late",
  },
  {
    date: "2025-06-04 10:45",
    subject: "Chemistry",
    tutor: "Mr. Brown",
    status: "Present",
  },
  {
    date: "2025-06-05 09:00",
    subject: "Biology",
    tutor: "Mr. David",
    status: "Present",
  },
];

export default function RecentAttendance() {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Attendance</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="text-left bg-gray-100 text-gray-600 uppercase text-xs">
              <th className="p-3 rounded-tl-lg">Date / Time</th>
              <th className="p-3">Subject</th>
              <th className="p-3">Tutor</th>
              <th className="p-3 rounded-tr-lg">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentAttendance.map((record, index) => (
              <tr
                key={index}
                className="border-b hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="p-3 text-gray-700">{record.date}</td>
                <td className="p-3 font-medium text-gray-800">{record.subject}</td>
                <td className="p-3 text-gray-700">{record.tutor}</td>
                <td className="p-3">
                  {record.status === "Present" && (
                    <Badge className="bg-green-100 text-green-700">Present</Badge>
                  )}
                  {record.status === "Absent" && (
                    <Badge className="bg-red-100 text-red-700">Absent</Badge>
                  )}
                  {record.status === "Late" && (
                    <Badge className="bg-yellow-100 text-yellow-700">Late</Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
