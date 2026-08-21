'use client'

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { ResendVerificationAction, SigninAction } from "@/server/auth";
import { ToastError, ToastSuccess } from "../ui/custom/toast";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { PasswordInput } from "../ui/custom/password-input";
import { ROUTES } from "@/config/routes";
import { UserRole } from "@/types/user";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";


const formSchema = z.object({
  // Holds either an email address or a Student ID, depending on the toggle
  // below - the backend's LoginDto branches on which shape it's given, so
  // format validation for the email case happens there rather than here.
  identifier: z.string().min(1, { message: "This field is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
});

// Same storage keys tutor-application-context.tsx and
// tutor-application-status.tsx already read from - writing to them here
// lets those pages resume exactly as if the tutor had never left the
// browser, just now reachable via a real login instead of only surviving
// in localStorage across a refresh.
const DRAFT_STORAGE_KEY = "stc_tutor_application_draft";
const STATUS_STORAGE_KEY = "stc_tutor_application_status";

const ROLE_DASHBOARD: Record<UserRole, string> = {
  [UserRole.STUDENT]: "/lms-home/student/dashboard",
  [UserRole.TUTOR]: "/lms-home/tutor/dashboard",
  [UserRole.PARENT]: "/lms-home/parent/dashboard",
  [UserRole.HOD]: "/lms-home/admin/dashboard",
  [UserRole.STC_ADMIN]: "/lms-home/admin/dashboard",
  [UserRole.TUTOR_ADMIN]: "/lms-home/admin/dashboard",
  [UserRole.SUPER_ADMIN]: "/lms-home/admin/dashboard",
  [UserRole.ALMIGHTY_ADMIN]: "/lms-home/admin/dashboard",
};

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const service = searchParams.get("service");
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"email" | "studentId">("email");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setUnverifiedEmail(null);
    const [res, error] = await SigninAction(
      loginMethod === "studentId"
        ? { studentId: data.identifier, password: data.password }
        : { email: data.identifier, password: data.password }
    );

    if (res?.data) {
      const { tutorApplicationStatus, tutorApplicationId, draftToken, statusToken } = res.data;

      if (tutorApplicationStatus === "DRAFT" && draftToken && tutorApplicationId) {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ applicationId: tutorApplicationId, draftToken }));
        ToastSuccess("Welcome back - let's continue your application.");
        router.push("/auth/apply-tutor");
        return;
      }

      if (tutorApplicationStatus === "NEEDS_MORE_INFO" && statusToken && tutorApplicationId) {
        localStorage.setItem(STATUS_STORAGE_KEY, JSON.stringify({ applicationId: tutorApplicationId, statusToken }));
        ToastSuccess("Welcome back - our team needs a bit more from you.");
        router.push("/auth/tutor-application-status");
        return;
      }

      ToastSuccess(res.message);
      const role = res.data.user.role;
      const canEnroll = role === UserRole.STUDENT || role === UserRole.PARENT;
      router.push(
        service && canEnroll ? `/dashboard/enroll?service=${service}` : ROLE_DASHBOARD[role] ?? ROUTES.DASHBOARD.HOME
      );
    }
    if (error) {
      if (error === "EMAIL_NOT_VERIFIED") {
        setUnverifiedEmail(data.identifier);
        ToastError("Please verify your email before logging in.");
      } else if (error === "ACCOUNT_PENDING_APPROVAL") {
        ToastError("Your tutor application is still under review. We'll email you once it's decided.");
      } else if (error === "ACCOUNT_SUSPENDED") {
        ToastError("This account has been suspended. Contact support if you think this is a mistake.");
      } else {
        ToastError(error);
      }
      if (process.env.NODE_ENV === "development") {
        console.error("Login error:", error);
      }
    }
  }

  const handleResend = async () => {
    if (!unverifiedEmail) return;
    setIsResending(true);
    const [res, error] = await ResendVerificationAction(unverifiedEmail);
    setIsResending(false);
    if (res) ToastSuccess(res.message);
    if (error) ToastError(error);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              checked={loginMethod === "email"}
              onChange={() => {
                setLoginMethod("email");
                form.setValue("identifier", "");
              }}
            />
            Email
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              checked={loginMethod === "studentId"}
              onChange={() => {
                setLoginMethod("studentId");
                form.setValue("identifier", "");
              }}
            />
            Student ID
          </label>
        </div>

        <div className="flex flex-col gap-2">
          <FormField
            control={form.control}
            name="identifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{loginMethod === "studentId" ? "Student ID" : "Email"}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type={loginMethod === "studentId" ? "text" : "email"}
                    placeholder={loginMethod === "studentId" ? "e.g. STC-2026-0041" : "Enter your email"}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="relative">
                <FormLabel>Password</FormLabel>

                <FormControl>
                  <PasswordInput {...field} placeholder="Enter your password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {unverifiedEmail && (
          <div className="text-sm bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-3 flex items-center justify-between gap-2">
            <span>Your email isn&apos;t verified yet.</span>
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="underline underline-offset-4 font-medium disabled:opacity-50"
            >
              {isResending ? "Sending..." : "Resend email"}
            </button>
          </div>
        )}

        <div className="text-right">
          <Link
            href={ROUTES.AUTH.FORGOT_PASSWORD}
            className="underline text-xs underline-offset-4">
            Forgot password?
          </Link>
        </div>

        <Button disabled={form.formState.isSubmitting} type="submit" className="w-full">
          {form.formState.isSubmitting && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Login
        </Button>

      </form>

      <div className="text-center text-sm mt-4 space-y-1">
        <p>
          Don&apos;t have an account?{" "}
          <Link href={ROUTES.AUTH.REGISTER} className="underline underline-offset-4">
            Register
          </Link>
        </p>
        <p>
          Want to teach with us?{" "}
          <Link href="/auth/apply-tutor" className="underline underline-offset-4">
            Apply as a tutor
          </Link>
        </p>
      </div>
    </Form>
  )
}
