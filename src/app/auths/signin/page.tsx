"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import { useRouter } from "next/navigation";


type SignInFormInputs = {
  email: string;
  password: string;
};

export default function SignIn() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm<SignInFormInputs>();

  const form = useForm({
    // resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [showPassword, setShowPassword] = useState(false);

  // // Fake async email validation (replace with real API call)
  // const validateEmailAsync = async (email: string) => {
  //   return new Promise<boolean>((resolve) => {
  //     setTimeout(() => {
  //       // Reject "blocked@example.com" as example
  //       resolve(email.toLowerCase() !== "blocked@example.com");
  //     }, 1000);
  //   });
  // };

  const onSubmit = async (data: SignInFormInputs) => {
    // Clear previous async errors before submitting
    clearErrors("email");

    // const emailValid = await validateEmailAsync(data.email);
    // if (!emailValid) {
    //   setError("email", {
    //     type: "manual",
    //     message: "This email is blocked or not allowed",
    //   });
    //   return;
    // }

    console.log("Login data:", data);
    // Continue with your login logic here
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-900">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>

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
                message: "Please enter a valid email address",
              },
            })}
            className="w-full border px-3 py-2 rounded outline-none focus:ring focus:ring-blue-300"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password with show/hide toggle */}
        <div className="mb-4 relative">
          <label htmlFor="password" className="block font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
              pattern: {
                value: /^[A-Za-z0-9]+$/,
                message:
                  "Password must contain only letters (case sensitive) and numbers",
              },
            })}
            className="w-full border px-3 py-2 rounded outline-none focus:ring focus:ring-blue-300"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-sm text-blue-600 hover:text-blue-800 select-none"
            tabIndex={-1}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Forgot Password */}
        <div className="text-sm mb-4 text-right">
          <button
            type="button"
            onClick={() => router.push("/forgotpassword")}
            className="text-blue-500 hover:underline">
            Forgot Password?
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 rounded text-white ${isSubmitting ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
