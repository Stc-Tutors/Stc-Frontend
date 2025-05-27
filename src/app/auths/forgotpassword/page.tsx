"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";

type ForgotPasswordInputs = {
  email: string;
};

export default function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInputs>();

  const [successMessage, setSuccessMessage] = useState("");

  const onSubmit = async (data: ForgotPasswordInputs) => {
    setSuccessMessage(""); // reset any old messages

    // Simulate API request delay
    await new Promise((res) => setTimeout(res, 1500));

    // Normally: await fetch("/api/forgot-password", {...})

    console.log("Reset password request for:", data.email);

    setSuccessMessage("Password reset link sent to your email.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-900">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password</h2>

        {/* Email */}
        <div className="mb-4">
          <label htmlFor="email" className="block font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email address",
              },
            })}
            className="w-full border px-3 py-2 rounded outline-none focus:ring focus:ring-blue-300"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Success message */}
        {successMessage && (
          <p className="text-green-600 text-sm mb-4 text-center">
            {successMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 rounded text-white ${
            isSubmitting ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isSubmitting ? "Sending..." : "Send Reset Link"}
        </button>

        <div className="text-sm mt-4 text-center">
          <a href="/signin" className="text-blue-500 hover:underline">
            Back to Sign In
          </a>
        </div>
      </form>
    </div>
  );
}
