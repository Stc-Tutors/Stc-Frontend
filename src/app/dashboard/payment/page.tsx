"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ServiceSummaryCard from "@/app/components/ServiceSummaryCard";

export default function PaymentPage() {
  const router = useRouter();
  const [childInfo, setChildInfo] = useState<any>(null);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [totalMonthly, setTotalMonthly] = useState<number>(0);

  useEffect(() => {
  const savedInfo = sessionStorage.getItem("childInfo");
  const savedSchedule = sessionStorage.getItem("schedule");
  const savedForm = sessionStorage.getItem("childInfoFormData");

  let mergedInfo = {};

  if (savedInfo) {
    mergedInfo = JSON.parse(savedInfo);
  }

  if (savedForm) {
    const formInfo = JSON.parse(savedForm);
    mergedInfo = { ...formInfo, ...mergedInfo }; // Merge form data with subject info
  }

  setChildInfo(mergedInfo);

  if (savedSchedule) {
    const parsedSchedule = JSON.parse(savedSchedule);
    setSchedule(parsedSchedule);

    // Calculate cost
    const ratePerHour = 1000;
    const total = parsedSchedule.reduce((acc: number, sub: any) => {
      const hoursPerDay = sub.duration / 60;
      const totalHours = sub.days.length * hoursPerDay;
      return acc + totalHours * ratePerHour * 4;
    }, 0);
    setTotalMonthly(total);
  }
}, []);

const handleSubmit = async () => {
  // Fetch all the necessary data from session storage
  const data = {
    ...childInfo,
    totalMonthly: totalMonthly,
  }

  console.log(data);
}

  

  if (!childInfo) return <p className="text-center p-6">Loading summary...</p>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Review & Confirm</h2>

      <ServiceSummaryCard
        childName={childInfo.fullName || "Child"}
        serviceType={childInfo.learningFocus}
        curriculum={childInfo.curriculum}
        educationLevel={childInfo.educationLevel}
        gradeLevel={childInfo.gradeLevel}
        selectedSubjects={childInfo.selectedSubjects}
        learningGoals={childInfo.learningGoals}
        tutorGender={childInfo.tutorGender}
        schedule={schedule}
        totalCost={totalMonthly}
      />

      <button onClick={handleSubmit} className="mt-6 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 w-full">
        Confirm and Complete Signup
      </button>

      <button
  onClick={() => {
    // ✅ Ensure current schedule is saved
    sessionStorage.setItem("schedule", JSON.stringify(schedule));
    router.push("/dashboard/schedule");
  }}
  className="w-full bg-gray-500 text-white py-2 px-4 rounded mt-2"
>
  Back
</button>

    </div>
  );
}