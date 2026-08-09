"use client";

import Link from "next/link";
import { Settings, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSelectedStudent } from "@/contexts/selected-student-context";

export default function ParentHeader() {
  const { students, selectedId, setSelectedId, selectedStudent: selected, isLoading } = useSelectedStudent();

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      {/* Left Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800">
          Parent Dashboard
        </h2>
        <p className="text-gray-500 text-sm">
          Manage your child education journey
        </p>

        <div className="flex flex-wrap items-center gap-3 mt-4">
          {isLoading ? (
            <span className="text-sm text-gray-400">Loading students...</span>
          ) : students.length === 0 ? (
            <span className="text-sm text-gray-500">No children linked to your account yet.</span>
          ) : (
            <>
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger className="w-[180px] border-gray-300 text-gray-700 focus:ring-0">
                  <SelectValue placeholder="Select Student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selected && (
                <span className="text-gray-500 text-sm">
                  {selected.serviceDetails?.ageLevel} · {selected.serviceDetails?.selectedSubjects?.join(", ")}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Section (Buttons) */}
      <div className="flex gap-3">
        <Link href="/lms-home/parent/profile">
          <Button
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <Settings className="w-4 h-4" />
            Manage
          </Button>
        </Link>

        <Link href="/dashboard/enroll">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2">
            Add Student
            <Plus size={16} />
          </Button>
        </Link>
      </div>
    </div>
  );
}
