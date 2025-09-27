"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { MdOutlineMailOutline } from "react-icons/md";
import { FcGlobe, FcBarChart, FcRating } from "react-icons/fc";
import { IoMdContact, IoMdBook } from "react-icons/io";
import { GiUpgrade } from "react-icons/gi";

// dummy student data (you can fetch this later from API/db)
const students = [
  {
    id: "123487",
    name: "Peter Jay",
    grade: "Beginner",
    subject: "Biology",
    curriculum: "Nigeria",
    avatar: "/avatar.png",
    email: "peterjay@example.com",
    nationality: "Nigerian",
    gender: "Male",
    result: "Excellent",
  },
  {
    id: "123488",
    name: "Sarah Lee",
    grade: "Intermediate",
    subject: "Math",
    curriculum: "UK",
    avatar: "/avatar.png",
    email: "sarahlee@example.com",
    nationality: "British",
    gender: "Female",
    result: "Very Good",
  },
];

export default function StudentProfilePage() {
  const { id } = useParams();
  const student = students.find((s) => s.id === id);

  if (!student) {
    return <p className="p-6">Student not found</p>;
  }

  return (
    <section className="bg-gray-100">
      <div className="bg-white flex justify-between py-12 px-24 ml-8 mr-9">
        <div className="flex gap-4">
          <div className="mt-2">
            <Image src={student.avatar} width={50} height={50} alt={student.name} />
          </div>
          <div>
            <h1 className="font-bold text-2xl mb-2">{student.name}</h1>
            <p className="text-gray-500">{student.subject} student at SC Tutor</p>
          </div>
        </div>
        <div>
          <button className="bg-blue-500 hover:bg-blue-700 py-2 px-3 text-white rounded cursor-pointer transition">
            Send Message
          </button>
        </div>
      </div>

      <section className="bg-white mt-8 ml-8 mr-9 pl-12 py-5 space-y-5">
        <div className="flex gap-5">
          <div>
            <div className="flex gap-2">
              <MdOutlineMailOutline className="mt-1" />
              <h3 className="font-bold">Email ID</h3>
            </div>
            <p>{student.email}</p>
          </div>
          <div>
            <div className="flex gap-2">
              <FcGlobe className="mt-1" />
              <label className="font-bold">Nationality</label>
            </div>
            <p>{student.nationality}</p>
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
              <h3 className="font-bold">Curriculum</h3>
            </div>
            <p>{student.curriculum}</p>
          </div>
        </div>

        <div className="flex gap-20">
          <div>
            <div className="flex gap-2">
              <GiUpgrade className="mt-1" />
              <h3 className="font-bold">Grade</h3>
            </div>
            <p>{student.grade}</p>
          </div>
          <div>
            <div className="flex gap-2">
              <FcBarChart className="mt-1" />
              <h3 className="font-bold">Current result</h3>
            </div>
            <p>{student.result}</p>
          </div>
        </div>
      </section>
    </section>
  );
}
