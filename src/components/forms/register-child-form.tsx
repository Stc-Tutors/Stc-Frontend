'use client'

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { RegisterChildAction } from "@/server/auth";
import { ToastError, ToastSuccess } from "../ui/custom/toast";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { PasswordInput } from "../ui/custom/password-input";
import { Loader2, Copy } from "lucide-react";

const formSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
});

export default function RegisterChildForm() {
  const [createdStudentId, setCreatedStudentId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      password: "",
      dateOfBirth: "",
      gender: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const [res, error] = await RegisterChildAction(data);

    if (res?.data) {
      ToastSuccess(res.message);
      setCreatedStudentId(res.data.studentId);
      form.reset();
    }
    if (error) {
      ToastError(error);
    }
  };

  // A one-time reveal - the backend has no "look up my child's Student ID
  // again" endpoint, so the parent must copy it down now.
  if (createdStudentId) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-gray-600">
          Account created. Share this Student ID and the password you set with your child - they&apos;ll use it to log in.
        </p>
        <div className="flex items-center justify-center gap-2 bg-blue-50 border border-blue-200 rounded-lg py-3 px-4">
          <span className="text-lg font-mono font-semibold text-blue-900">{createdStudentId}</span>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(createdStudentId);
              ToastSuccess("Copied to clipboard");
            }}
            className="text-blue-600 hover:text-blue-800"
            aria-label="Copy Student ID"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
        <Button variant="outline" onClick={() => setCreatedStudentId(null)}>
          Add another child
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Child's first name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Child's last name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Birth (optional)</FormLabel>
              <FormControl>
                <Input {...field} type="date" />
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
              <FormLabel>Set a Password for Your Child</FormLabel>
              <FormControl>
                <PasswordInput {...field} placeholder="Choose a password for your child to log in with" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button disabled={form.formState.isSubmitting} type="submit" className="w-full">
          {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Child Account
        </Button>
      </form>
    </Form>
  );
}
