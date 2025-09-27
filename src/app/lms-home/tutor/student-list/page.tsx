"use client";

import { ArrowLeft, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import TutorsCard from "@/components/tutorDashboard/TutorsCard"
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
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";

const students = [
  {
    id: "123487",
    name: "Peter Jay",
    grade: "Beginner",
    subject: "Biology",
    curriculum: "Nigeria",
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
    id: "123487",
    name: "Detrickola Williams",
    grade: "Beginner",
    subject: "Biology",
    curriculum: "Nigeria",
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
    id: "123487",
    name: "Detrickola Williams",
    grade: "Beginner",
    subject: "Biology",
    curriculum: "Nigeria",
    avatar: "/avatar.png",
  },
  {
    id: "123487",
    name: "Peter Jay",
    grade: "Beginner",
    subject: "Biology",
    curriculum: "Nigeria",
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
    id: "123487",
    name: "Detrickola Williams",
    grade: "Beginner",
    subject: "Biology",
    curriculum: "Nigeria",
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
    id: "123487",
    name: "Detrickola Williams",
    grade: "Beginner",
    subject: "Biology",
    curriculum: "Nigeria",
    avatar: "/avatar.png",
  },
  {
    id: "123487",
    name: "Peter Jay",
    grade: "Beginner",
    subject: "Biology",
    curriculum: "Nigeria",
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
    id: "123487",
    name: "Detrickola Williams",
    grade: "Beginner",
    subject: "Biology",
    curriculum: "Nigeria",
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
    id: "123487",
    name: "Detrickola Williams",
    grade: "Beginner",
    subject: "Biology",
    curriculum: "Nigeria",
    avatar: "/avatar.png",
  },
  {
    id: "123487",
    name: "Peter Jay",
    grade: "Beginner",
    subject: "Biology",
    curriculum: "Nigeria",
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
    id: "123487",
    name: "Detrickola Williams",
    grade: "Beginner",
    subject: "Biology",
    curriculum: "Nigeria",
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
    id: "123487",
    name: "Detrickola Williams",
    grade: "Beginner",
    subject: "Biology",
    curriculum: "Nigeria",
    avatar: "/avatar.png",
  },
];

export default function StudentsPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push(`/lms-home/tutor/dashboard`);
  };

  // ---- Pagination ----
  const pageSize = 10;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(students.length / pageSize);
  const start = (page - 1) * pageSize;
  const current = students.slice(start, start + pageSize);

  const goTo = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  return (
    <div className="bg-white shadow rounded-2xl p-6">
      {/* Back nav */}
      <button
        onClick={handleBack}
        className="flex items-center text-1xl-gray-700 mb-4 cursor-pointer hover:text-blue-500">
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="text-1xl font-bold">BACK</span>
      </button>

        <div className="space-y-6 mb-6">
            <TutorsCard/>
        </div>
      <h1 className="text-2xl font-bold mb-6">Your Students</h1>

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
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            className="px-3 py-1.5 rounded border text-sm disabled:opacity-50"
            onClick={() => goTo(page - 1)}
            disabled={page === 1}
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => goTo(p)}
              className={`px-3 py-1.5 rounded border text-sm ${
                p === page
                  ? "bg-blue-600 text-white border-blue-600"
                  : "hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          ))}

          <button
            className="px-3 py-1.5 rounded border text-sm disabled:opacity-50"
            onClick={() => goTo(page + 1)}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
    </div>
  );
}



// "use client";

// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import Image from "next/image";
// import { useState } from "react";

// interface Student {
//   id: number;
//   name: string;
//   subject: string;
//   progress: number;
//   avatar: string;
// }

// const students: Student[] = [
//   { id: 1, name: "John Doe", subject: "Mathematics", progress: 75, avatar: "/avatar1.png" },
//   { id: 2, name: "Jane Smith", subject: "Physics", progress: 60, avatar: "/avatar2.png" },
//   { id: 3, name: "Michael Brown", subject: "English", progress: 90, avatar: "/avatar3.png" },
//   // ...more
// ];

// export default function StudentCards() {
//   const [currentPage, setCurrentPage] = useState(1);
//   const studentsPerPage = 6;

//   const indexOfLast = currentPage * studentsPerPage;
//   const indexOfFirst = indexOfLast - studentsPerPage;
//   const currentStudents = students.slice(indexOfFirst, indexOfLast);

//   const totalPages = Math.ceil(students.length / studentsPerPage);

//   return (
//     <div className="p-6">
//       {/* Grid of Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//         {currentStudents.map((student) => (
//           <Card key={student.id} className="rounded-2xl shadow-md">
//             <CardHeader className="flex items-center gap-3">
//               <Image
//                 src={student.avatar}
//                 alt={student.name}
//                 width={40}
//                 height={40}
//                 className="rounded-full"
//               />
//               <CardTitle>{student.name}</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <p className="text-gray-600">{student.subject}</p>
//               <p className="text-sm text-blue-600 font-medium">
//                 Progress: {student.progress}%
//               </p>
//               <Button className="mt-3 w-full">View Profile</Button>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       {/* Pagination */}
//       <div className="flex justify-center items-center gap-2 mt-6">
//         <Button
//           variant="outline"
//           disabled={currentPage === 1}
//           onClick={() => setCurrentPage((p) => p - 1)}
//         >
//           Prev
//         </Button>

//         {Array.from({ length: totalPages }, (_, i) => (
//           <Button
//             key={i + 1}
//             variant={currentPage === i + 1 ? "default" : "outline"}
//             onClick={() => setCurrentPage(i + 1)}
//           >
//             {i + 1}
//           </Button>
//         ))}

//         <Button
//           variant="outline"
//           disabled={currentPage === totalPages}
//           onClick={() => setCurrentPage((p) => p + 1)}
//         >
//           Next
//         </Button>
//       </div>
//     </div>
//   );
// }
