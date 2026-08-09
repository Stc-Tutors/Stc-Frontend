"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MdOutlineMailOutline } from "react-icons/md";
import { FcGlobe, FcBarChart } from "react-icons/fc";
import { IoMdContact, IoMdBook } from "react-icons/io";
import { GiUpgrade } from "react-icons/gi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GetEnrollmentAction } from "@/server/enrollment";
import StudentGradingPanel from "@/components/tutorDashboard/StudentGradingPanel";
import { Student, studentAvatarUrl } from "@/types/student";

export default function StudentProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const [res, err] = await GetEnrollmentAction(id as string);
      if (err || !res?.data) {
        setError(err || "Student not found");
      } else {
        setStudent(res.data);
      }
      setIsLoading(false);
    };
    load();
  }, [id]);

  if (isLoading) return <p className="p-6">Loading...</p>;
  if (error || !student) return <p className="p-6">{error || "Student not found"}</p>;

  return (
    <section className="bg-gray-100">
      <div className="bg-white flex justify-between py-12 px-24 ml-8 mr-9">
        <div className="flex gap-4 items-center">
          <Avatar className="h-16 w-16">
            <AvatarImage src={studentAvatarUrl(student.user)} alt={student.fullName} />
            <AvatarFallback>{student.fullName?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-bold text-2xl mb-2">{student.fullName}</h1>
            <p className="text-gray-500">
              {student.serviceDetails?.selectedSubjects?.join(", ")} student at SC Tutor
            </p>
          </div>
        </div>
        <div>
          <button
            title="Direct messaging with students isn't available - this opens your admin support thread instead"
            onClick={() => router.push("/lms-home/tutor/messages")}
            className="bg-blue-500 hover:bg-blue-700 py-2 px-3 text-white rounded cursor-pointer transition"
          >
            Send Message
          </button>
        </div>
      </div>

      <section className="bg-white mt-8 ml-8 mr-9 pl-12 py-5 space-y-5">
        <div className="flex gap-5">
          <div>
            <div className="flex gap-2">
              <MdOutlineMailOutline className="mt-1" />
              <h3 className="font-bold">Parent Email</h3>
            </div>
            <p>{student.parentEmail}</p>
          </div>
          <div>
            <div className="flex gap-2">
              <FcGlobe className="mt-1" />
              <label className="font-bold">Country</label>
            </div>
            <p>{student.countryOfResidence}</p>
          </div>
        </div>

        <div className="flex gap-5">
          <div>
            <div className="flex gap-2">
              <IoMdContact className="mt-1" />
              <h3 className="font-bold">Gender</h3>
            </div>
            <p>{student.gender}</p>
          </div>
          <div>
            <div className="flex gap-2">
              <IoMdBook className="mt-1" />
              <h3 className="font-bold">Primary Language</h3>
            </div>
            <p>{student.primaryLanguage}</p>
          </div>
        </div>

        <div className="flex gap-20">
          <div>
            <div className="flex gap-2">
              <GiUpgrade className="mt-1" />
              <h3 className="font-bold">Age Level</h3>
            </div>
            <p>{student.serviceDetails?.ageLevel}</p>
          </div>
          <div>
            <div className="flex gap-2">
              <FcBarChart className="mt-1" />
              <h3 className="font-bold">Enrollment Status</h3>
            </div>
            <p>{student.enrollmentStatus}</p>
          </div>
        </div>
      </section>

      <section className="bg-white mt-8 ml-8 mr-9 pl-12 pr-9 py-5">
        <h2 className="font-bold text-xl mb-4">Assignments &amp; Grading</h2>
        <StudentGradingPanel studentId={student.id} />
      </section>
    </section>
  );
}
