"use client";

import { useRouter } from "next/navigation";

export default function SelectServicePage() {
  const router = useRouter();

  const handleSelect = (type: string, focus: string) => {
    sessionStorage.setItem("serviceType", type);
    sessionStorage.setItem("learningFocus", focus);
    router.push("/dashboard/signup");
  };

  return (
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-xl">
        <h1 className="text-2xl font-bold mb-6 text-center">Select a Service to Enroll In</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          {/* Academic Tutoring */}
          <div
            onClick={() => handleSelect("academic-tutoring", "Academic Tutoring")}
            className="cursor-pointer border p-4 rounded hover:shadow-lg transition bg-blue-50"
          >
            <h2 className="font-semibold text-lg mb-2">📚 Academic Tutoring</h2>
            <p className="text-sm text-gray-600">Core subject support by curriculum & grade</p>
          </div>

          {/* Exam Prep */}
          <div
            onClick={() => handleSelect("exam-preparation", "Exam Preparation")}
            className="cursor-pointer border p-4 rounded hover:shadow-lg transition bg-yellow-50"
          >
            <h2 className="font-semibold text-lg mb-2">🎯 Exam Preparation</h2>
            <p className="text-sm text-gray-600">Focused prep for NCEE, BECE, WAEC, IGCSE, etc.</p>
          </div>

          {/* Tech for Kids */}
          <div
            onClick={() => handleSelect("tech-bootcamp", "Tech for Kids")}
            className="cursor-pointer border p-4 rounded hover:shadow-lg transition bg-green-50"
          >
            <h2 className="font-semibold text-lg mb-2">💻 Tech for Kids</h2>
            <p className="text-sm text-gray-600">Bootcamps in coding, robotics, design & more</p>
          </div>
          
          <div className="flex justify-center mt-6">
            <button
            onClick={() => router.push("/dashboard")}
            className="bg-white text-blue-600 border border-gray-300 px-6 py-2 rounded-md hover:bg-gray-100 transition">
                ← Back
                </button>
                </div>
        </div>
      </div>
  );
}