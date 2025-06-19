// "use client";

// app/payment/page.tsx

// import Script from "next/script";
// import Paystack from "../../components/Paystack";

// export default function PaymentPage() {
//   return (
//     <>
//       <Script
//         src="https://js.paystack.co/v1/inline.js"
//         strategy="beforeInteractive"
//       />
//       <div className="p-4">
//         <h1 className="text-xl font-bold mb-4">Choose Your Payment Plan</h1>
//         <Paystack />
//       </div>
//     </>
//   );
// }
// import { useState } from "react";
// import { useRouter } from "next/navigation";

// export default function PaymentPage() {
//   const router = useRouter();
  
//   // Dummy Payment Data
//   const paymentDetails = {
//     subject: "Economics",
//     hourlyRate: 5000,
//     hoursPerDay: 2,
//     daysPerWeek: 3,
//     weeksPerMonth: 4,
//   };

//   // Calculate totals
//   const dailyCost = paymentDetails.hourlyRate * paymentDetails.hoursPerDay;
//   const weeklyCost = dailyCost * paymentDetails.daysPerWeek;
//   const monthlyCost = weeklyCost * paymentDetails.weeksPerMonth;

//   const handlePayment = () => {
//     // Redirect to Monnify or Payment Gateway
//     router.push("/payment/checkout");
//   };

//   return (
//     <div className="min-h-screen bg-blue-900 text-white flex flex-col items-center py-12">
//       {/* Progress Bar */}
//       <div className="flex space-x-4 mb-6">
//         <div className="w-8 h-1 bg-white rounded"></div>
//         <div className="w-8 h-1 bg-white rounded"></div>
//         <div className="w-8 h-1 bg-white rounded"></div>
//         <div className="w-8 h-1 bg-yellow-400 rounded"></div>
//       </div>

//       {/* Payment Breakdown Box */}
//       <div className="bg-white text-black p-6 rounded-lg shadow-lg w-full max-w-lg">
//         <h2 className="text-lg font-bold mb-4">Payment Breakdown</h2>
//         <div className="space-y-2 text-gray-700">
//           <div className="flex justify-between"><span>Subject:</span><span>{paymentDetails.subject}</span></div>
//           <div className="flex justify-between"><span>Hourly Rate:</span><span>₦{paymentDetails.hourlyRate}</span></div>
//           <div className="flex justify-between"><span>Hours per Day:</span><span>₦{paymentDetails.hourlyRate} × {paymentDetails.hoursPerDay} = ₦{dailyCost}</span></div>
//           <div className="flex justify-between"><span>Days per Week:</span><span>₦{dailyCost} × {paymentDetails.daysPerWeek} = ₦{weeklyCost}</span></div>
//           <div className="flex justify-between font-bold"><span>Total per Month:</span><span>₦{monthlyCost}</span></div>
//         </div>

//         {/* Buttons */}
//         <div className="mt-6 flex justify-between">
//           <button
//             onClick={() => router.back()}
//             className="px-4 py-2 border border-gray-400 text-gray-700 rounded-lg"
//           >
//             Enquires
//           </button>
//           <button
//             onClick={handlePayment}
//             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//           >
//             Make Payment
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ServiceSummaryCard from "@/app/components/ServiceSummaryCard";

export default function PaymentPage() {
  const router = useRouter();
  const [childInfo, setChildInfo] = useState<any>(null);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [totalMonthly, setTotalMonthly] = useState<number>(0);

  // useEffect(() => {
  //   const savedInfo = sessionStorage.getItem("childInfo");
  //   const savedSchedule = sessionStorage.getItem("schedule");

  //   if (savedInfo) {
  //     setChildInfo(JSON.parse(savedInfo));
  //   }
  //   if (savedSchedule) {
  //     const parsedSchedule = JSON.parse(savedSchedule);
  //     setSchedule(parsedSchedule);

  //     // Calculate cost
  //     const ratePerHour = 1000;
  //     const total = parsedSchedule.reduce((acc: number, sub: any) => {
  //       const hoursPerDay = sub.duration / 60;
  //       const totalHours = sub.days.length * hoursPerDay;
  //       return acc + totalHours * ratePerHour * 4;
  //     }, 0);
  //     setTotalMonthly(total);
  //   }
  // }, []);

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

      <button className="mt-6 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 w-full">
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