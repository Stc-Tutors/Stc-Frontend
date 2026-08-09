"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Clock, MinusCircle } from "lucide-react";
import { GetStudentAttendanceAction } from "@/server/attendance";
import { Attendance, AttendanceStatus } from "@/types/attendance";

interface AttendanceRecordProps {
  studentId?: string;
}

const STATUS_ICON: Record<AttendanceStatus, React.ReactNode> = {
  [AttendanceStatus.PRESENT]: <CheckCircle className="w-4 h-4 text-green-600" />,
  [AttendanceStatus.ABSENT]: <XCircle className="w-4 h-4 text-red-500" />,
  [AttendanceStatus.LATE]: <Clock className="w-4 h-4 text-yellow-500" />,
  [AttendanceStatus.EXCUSED]: <MinusCircle className="w-4 h-4 text-gray-400" />,
};

export default function AttendanceRecord({ studentId }: AttendanceRecordProps) {
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

  const counts = {
    [AttendanceStatus.PRESENT]: records.filter((r) => r.status === AttendanceStatus.PRESENT).length,
    [AttendanceStatus.ABSENT]: records.filter((r) => r.status === AttendanceStatus.ABSENT).length,
    [AttendanceStatus.LATE]: records.filter((r) => r.status === AttendanceStatus.LATE).length,
    [AttendanceStatus.EXCUSED]: records.filter((r) => r.status === AttendanceStatus.EXCUSED).length,
  };
  const rate = records.length === 0 ? null : Math.round((counts[AttendanceStatus.PRESENT] / records.length) * 100);

  const last7 = records.slice(0, 7).reverse();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Attendance Record</CardTitle>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : !studentId ? (
          <p className="text-sm text-gray-500">Select a child to view attendance.</p>
        ) : records.length === 0 ? (
          <p className="text-sm text-gray-500">No attendance recorded yet.</p>
        ) : (
          <div className="border rounded-lg p-5 bg-gray-50 max-w-md">
            <h3 className="text-sm font-semibold mb-3">Attendance Summary</h3>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span>Present</span>
                <span className="text-green-600 font-semibold">{counts[AttendanceStatus.PRESENT]}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Absent</span>
                <span className="text-red-500 font-semibold">{counts[AttendanceStatus.ABSENT]}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Late</span>
                <span className="text-yellow-500 font-semibold">{counts[AttendanceStatus.LATE]}</span>
              </div>
              {rate !== null && (
                <div className="flex justify-between text-sm">
                  <span>Attendance Rate</span>
                  <span className="text-blue-600 font-semibold">{rate}%</span>
                </div>
              )}
            </div>

            <h3 className="text-sm font-semibold mb-2">Recent Sessions</h3>
            <div className="flex items-center gap-3 flex-wrap">
              {last7.map((r) => (
                <div key={r.id} className="flex flex-col items-center text-xs">
                  {STATUS_ICON[r.status]}
                  <span className="text-gray-600">{new Date(r.date).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
