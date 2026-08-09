"use client";

import { Button } from "@/components/ui/button";
import { MessageSquare, CalendarDays } from "lucide-react";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { GetLinkedStudentsAction, GetEnrollmentsAction } from "@/server/enrollment";
import { Student } from "@/types/student";

interface ParentAnalyticsHeaderProps {
  onStudentChange?: (studentId: string) => void;
}

export default function ParentAnalyticsHeader({ onStudentChange }: ParentAnalyticsHeaderProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [linkedRes] = await GetLinkedStudentsAction();
      const [ownRes] = await GetEnrollmentsAction();

      const byId = new Map<string, Student>();
      [...(linkedRes?.data ?? []), ...(ownRes?.data ?? [])].forEach((s) => byId.set(s.id, s));
      const all = Array.from(byId.values());

      setStudents(all);
      if (all[0]) {
        setSelectedId(all[0].id);
        onStudentChange?.(all[0].id);
      }
      setIsLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    onStudentChange?.(id);
  };

  const selected = students.find((s) => s.id === selectedId);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      {/* Top Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left: Title and Subtitle */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Performance Monitoring</h2>
          <p className="text-gray-500 text-sm">
            Manage your student’s academic reports, payment records, and billing information for all your students.
          </p>
        </div>

        {/* Right: Buttons */}
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2 border-blue-500 text-blue-600 hover:bg-blue-50">
            <MessageSquare size={16} />
            Message Admin
          </Button>
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <CalendarDays size={16} />
            Schedule Session
          </Button>
        </div>
      </div>

      {/* Student + Track Row */}
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <div className="relative">
          <select
            value={selectedId}
            onChange={(e) => handleSelect(e.target.value)}
            disabled={students.length === 0}
            className="appearance-none flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg min-w-[180px] text-gray-700 bg-white hover:bg-gray-50"
          >
            {students.length === 0 && <option>{isLoading ? "Loading..." : "No students linked"}</option>}
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fullName}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>

        {selected && (
          <p className="text-gray-600 text-sm">
            {selected.serviceDetails?.ageLevel}
            <span className="mx-2 text-gray-400">•</span>
            {selected.serviceDetails?.selectedSubjects?.join(", ")}
          </p>
        )}
      </div>
    </div>
  );
}
