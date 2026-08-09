"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GetStudentAttendanceAction } from "@/server/attendance";
import { Attendance, AttendanceStatus } from "@/types/attendance";

interface RecentAttendanceProps {
  studentId?: string;
}

const BADGE_CLASS: Record<AttendanceStatus, string> = {
  [AttendanceStatus.PRESENT]: "bg-green-100 text-green-700",
  [AttendanceStatus.ABSENT]: "bg-red-100 text-red-700",
  [AttendanceStatus.LATE]: "bg-yellow-100 text-yellow-700",
  [AttendanceStatus.EXCUSED]: "bg-gray-100 text-gray-700",
};

export default function RecentAttendance({ studentId }: RecentAttendanceProps) {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!studentId) {
      setRecords([]);
      setIsLoading(false);
      return;
    }
    const load = async () => {
      setIsLoading(true);
      const [res] = await GetStudentAttendanceAction(studentId);
      setRecords(res?.data ?? []);
      setIsLoading(false);
    };
    load();
  }, [studentId]);

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Attendance</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : !studentId ? (
          <p className="text-sm text-gray-500">Select a child to view attendance.</p>
        ) : records.length === 0 ? (
          <p className="text-sm text-gray-500">No attendance recorded yet.</p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left bg-gray-100 text-gray-600 uppercase text-xs">
                <th className="p-3 rounded-tl-lg">Date</th>
                <th className="p-3">Course</th>
                <th className="p-3 rounded-tr-lg">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="border-b hover:bg-gray-50 transition-colors duration-150">
                  <td className="p-3 text-gray-700">{new Date(record.date).toLocaleString()}</td>
                  <td className="p-3 font-medium text-gray-800">
                    {typeof record.course === "string" ? record.course : record.course.title}
                  </td>
                  <td className="p-3">
                    <Badge className={BADGE_CLASS[record.status]}>{record.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}
