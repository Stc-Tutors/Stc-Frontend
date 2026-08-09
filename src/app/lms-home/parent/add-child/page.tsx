"use client";

import RegisterChildForm from "@/components/forms/register-child-form";

export default function AddChildPage() {
  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm p-6">
      <h1 className="text-xl font-semibold text-gray-800 mb-1">Create a Child Account</h1>
      <p className="text-gray-500 text-sm mb-6">
        Your child logs in with a Student ID instead of an email - no email address needed.
      </p>
      <RegisterChildForm />
    </div>
  );
}
