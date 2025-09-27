// components/lms/YourStudents.tsx
"use client";

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

const students = [
  {
    id: "123487",
    name: "Peter Jay",
    grade: "Beginner",
    subject: "Biology",
    curriculum: "Nigeria",
    avatar: "/avatar.png", // replace with actual student profile images if available
  },
  {
    id: "123488",
    name: "Sarah Lee",
    grade: "Intermediate",
    subject: "Math",
    curriculum: "UK",
    avatar: "/avatar.png",
  },
  {
    id: "123488",
    name: "Sarah Lee",
    grade: "Intermediate",
    subject: "Math",
    curriculum: "UK",
    avatar: "/avatar.png",
  },
  {
    id: "123488",
    name: "Sarah Lee",
    grade: "Intermediate",
    subject: "Math",
    curriculum: "UK",
    avatar: "/avatar.png",
  },
  {
    id: "123488",
    name: "Sarah Lee",
    grade: "Intermediate",
    subject: "Math",
    curriculum: "UK",
    avatar: "/avatar.png",
  },
  {
    id: "123488",
    name: "Sarah Lee",
    grade: "Intermediate",
    subject: "Math",
    curriculum: "UK",
    avatar: "/avatar.png",
  },
  {
    id: "123488",
    name: "Sarah Lee",
    grade: "Intermediate",
    subject: "Math",
    curriculum: "UK",
    avatar: "/avatar.png",
  },
  {
    id: "123488",
    name: "Sarah Lee",
    grade: "Intermediate",
    subject: "Math",
    curriculum: "UK",
    avatar: "/avatar.png",
  },
];

export default function YourStudents() {
  const router = useRouter();
  return (
    <div className="bg-white shadow rounded-2xl p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Your Students</h2>
        <a href="/lms-home/tutor/student-list" className="text-blue-500 text-sm hover:underline">
        View All
        </a>

      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student ID</TableHead>
            <TableHead>Names</TableHead>
            <TableHead>Class Grade</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Curriculum</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {students.map((student) => (
            <TableRow key={student.id}>
              <TableCell>{student.id}</TableCell>
              <TableCell className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={student.avatar} />
                  <AvatarFallback>{student.name[0]}</AvatarFallback>
                </Avatar>
                {student.name}
              </TableCell>
              <TableCell>{student.grade}</TableCell>
              <TableCell>{student.subject}</TableCell>
              <TableCell>{student.curriculum}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <MoreHorizontal className="h-5 w-5 cursor-pointer" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`/lms-home/tutor/student-list/${student.id}`)}>
                      View student profile
                      </DropdownMenuItem>
                    {/* <DropdownMenuItem>Send Message</DropdownMenuItem> */}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
