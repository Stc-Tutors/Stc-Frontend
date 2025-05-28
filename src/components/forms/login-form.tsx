'use client'

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { SigninAction } from "@/server/auth";
import { ToastError, ToastSuccess } from "../ui/custom/toast";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { PasswordInput } from "../ui/custom/password-input";
import { ROUTES } from "@/config/routes";
import Link from "next/link";
import { Loader2 } from "lucide-react";


const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
});

export default function LoginForm() {

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const [res, error] = await SigninAction(data);

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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex flex-col gap-2">
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

      <div className="text-center text-sm mt-4">
        Don&apos;t have an account?{" "}
        <Link href={ROUTES.AUTH.REGISTER} className="underline underline-offset-4">
          Register
        </Link>
      </div>
    </Form>

  )
}