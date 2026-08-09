// components/lms/YourStudents.tsx
"use client";

import { useEffect, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { GetMyCourseStudentsAction } from "@/server/course";
import { Student, studentAvatarUrl } from "@/types/student";

export default function YourStudents() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [res] = await GetMyCourseStudentsAction();
      setStudents(res?.data ?? []);
      setIsLoading(false);
    };
    load();
  }, []);

  return (
    <div className="bg-white shadow rounded-2xl p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Your Students</h2>
        <a href="/lms-home/tutor/student-list" className="text-blue-500 text-sm hover:underline">
        View All
        </a>

      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500 py-4">Loading students...</p>
      ) : students.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">No students enrolled in your courses yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Subjects</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {students.slice(0, 6).map((student) => (
              <TableRow key={student.id}>
                <TableCell className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={studentAvatarUrl(student.user)} alt={student.fullName} />
                    <AvatarFallback>{student.fullName?.[0]}</AvatarFallback>
                  </Avatar>
                  {student.fullName}
                </TableCell>
                <TableCell>{student.serviceDetails?.selectedSubjects?.join(", ")}</TableCell>
                <TableCell>{student.enrollmentStatus}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <MoreHorizontal className="h-5 w-5 cursor-pointer" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/lms-home/tutor/student-list/${student.id}`)}>
                        View student profile
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
