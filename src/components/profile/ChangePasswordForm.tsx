"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/custom/password-input";
import { ToastError, ToastSuccess } from "@/components/ui/custom/toast";
import { ChangePasswordAction } from "@/server/auth";
import { passwordSchema } from "@/lib/password-policy";

const formSchema = z
  .object({
    // The user's existing password - deliberately not subject to the new
    // policy since it may predate it.
    currentPassword: z.string().min(1, { message: "Enter your current password" }),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, { message: "Confirm your new password" }),
  })
  .superRefine(({ newPassword, confirmPassword }, ctx) => {
    if (newPassword !== confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "The passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

export default function ChangePasswordForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const [res, error] = await ChangePasswordAction({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
    if (res) {
      ToastSuccess(res.message || "Password changed successfully");
      form.reset();
    }
    if (error) {
      ToastError(error);
    }
  };

  return (
    <section className="bg-white rounded-2xl shadow p-6 max-w-2xl">
      <h2 className="font-bold text-lg mb-4">Change Password</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current password</FormLabel>
                <FormControl>
                  <PasswordInput {...field} placeholder="Enter your current password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New password</FormLabel>
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
                <FormLabel>Confirm new password</FormLabel>
                <FormControl>
                  <PasswordInput {...field} placeholder="Confirm your new password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="mt-2" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update password
          </Button>
        </form>
      </Form>
    </section>
  );
}
