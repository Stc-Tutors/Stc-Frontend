"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PaymentPage() {
  const router = useRouter();
  
  // Dummy Payment Data
  const paymentDetails = {
    subject: "Economics",
    hourlyRate: 5000,
    hoursPerDay: 2,
    daysPerWeek: 3,
    weeksPerMonth: 4,
  };

  // Calculate totals
  const dailyCost = paymentDetails.hourlyRate * paymentDetails.hoursPerDay;
  const weeklyCost = dailyCost * paymentDetails.daysPerWeek;
  const monthlyCost = weeklyCost * paymentDetails.weeksPerMonth;

  const handlePayment = () => {
    // Redirect to Monnify or Payment Gateway
    router.push("/payment/checkout");
  };

  return (
    <div className="min-h-screen bg-blue-900 text-white flex flex-col items-center py-12">
      {/* Progress Bar */}
      <div className="flex space-x-4 mb-6">
        <div className="w-8 h-1 bg-white rounded"></div>
        <div className="w-8 h-1 bg-white rounded"></div>
        <div className="w-8 h-1 bg-white rounded"></div>
        <div className="w-8 h-1 bg-yellow-400 rounded"></div>
      </div>

      {/* Payment Breakdown Box */}
      <div className="bg-white text-black p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-lg font-bold mb-4">Payment Breakdown</h2>
        <div className="space-y-2 text-gray-700">
          <div className="flex justify-between"><span>Subject:</span><span>{paymentDetails.subject}</span></div>
          <div className="flex justify-between"><span>Hourly Rate:</span><span>₦{paymentDetails.hourlyRate}</span></div>
          <div className="flex justify-between"><span>Hours per Day:</span><span>₦{paymentDetails.hourlyRate} × {paymentDetails.hoursPerDay} = ₦{dailyCost}</span></div>
          <div className="flex justify-between"><span>Days per Week:</span><span>₦{dailyCost} × {paymentDetails.daysPerWeek} = ₦{weeklyCost}</span></div>
          <div className="flex justify-between font-bold"><span>Total per Month:</span><span>₦{monthlyCost}</span></div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-400 text-gray-700 rounded-lg"
          >
            Enquires
          </button>
          <button
            onClick={handlePayment}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Make Payment
          </button>
        </div>
      </div>
    </div>
  );
}