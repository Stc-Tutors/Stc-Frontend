'use client'

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";

import { ResetPasswordAction } from "@/server/auth";
import { ROUTES } from "@/config/routes";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { ToastError, ToastSuccess } from "../ui/custom/toast";
import { Button } from "../ui/button";
import { PasswordInput } from "../ui/custom/password-input";
import { passwordSchema } from "@/lib/password-policy";

const formSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string().min(1, { message: "Confirm password is required" }),
}).superRefine(({ confirmPassword, password }, ctx) => {
  if (confirmPassword !== password) {
    ctx.addIssue({
      code: 'custom',
      message: 'The passwords do not match',
      path: ['confirmPassword'],
    });
  }
});

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!token) {
      ToastError("Missing or invalid reset link. Please request a new one.");
      return;
    }

    const [res, error] = await ResetPasswordAction({ token, password: data.password });

    if (res) {
      ToastSuccess(res.message);
      router.push(ROUTES.AUTH.LOGIN);
    }
    if (error) {
      ToastError(error);
    }
  }

  if (!token) {
    return (
      <div className="text-center text-sm space-y-4">
        <p className="text-red-500">
          This reset link is missing or invalid. Please request a new one.
        </p>
        <Link href={ROUTES.AUTH.FORGOT_PASSWORD} className="underline underline-offset-4">
          Request a new reset link
        </Link>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <PasswordInput {...field} placeholder="Enter your new password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <PasswordInput {...field} placeholder="Confirm your new password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button disabled={form.formState.isSubmitting} type="submit" className="w-full">
          {form.formState.isSubmitting && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Reset Password
        </Button>
      </form>

      <div className="text-center text-sm mt-4">
        Go back to{" "}
        <Link href={ROUTES.AUTH.LOGIN} className="underline underline-offset-4">
          Login
        </Link>
      </div>
    </Form>
  )
}
