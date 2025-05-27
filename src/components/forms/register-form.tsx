'use client'

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { RegisterAction } from "@/server/auth";
import { ToastError, ToastSuccess } from "../ui/custom/toast";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { PasswordInput } from "../ui/custom/password-input";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/config/routes";
import { UserRole } from "@/types/user";


const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
  firstName: z.string().min(1, { message: "First name is required" }),
  middleName: z.string().optional(),
  lastName: z.string().min(1, { message: "Surname/LastName is required" }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits" }),
});

export default function RegisterForm() {

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phone: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const [res, error] = await RegisterAction({ ...data, role: UserRole.STUDENT });

    if (res) {
      ToastSuccess(res.message);
    }
    if (error) {
      ToastError(error);
    }
    form.reset();
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col gap-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="Enter your first name" />
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
                  <Input {...field} type="text" placeholder="Enter your last name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="Enter your email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <PhoneInput {...field} country={"us"} />
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

        <Button disabled={form.formState.isSubmitting} type="submit" className="w-full">
          {form.formState.isSubmitting && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Register
        </Button>
      </form>
      <div className="text-center text-sm mt-4">
        Already have an account?{" "}
        <Link href={ROUTES.AUTH.LOGIN} className="underline underline-offset-4">
          Log In
        </Link>
      </div>
    </Form>

  )
}