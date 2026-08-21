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
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/config/routes";
import { UserRole } from "@/types/user";
import { useRouter, useSearchParams } from "next/navigation";
import { passwordSchema } from "@/lib/password-policy";


const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: passwordSchema,
  firstName: z.string().min(1, { message: "First name is required" }),
  middleName: z.string().optional(),
  lastName: z.string().min(1, { message: "Surname/LastName is required" }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits" }),
  role: z.enum([UserRole.PARENT, UserRole.STUDENT]),
  confirmPassword: z.string().min(1, { message: "Confirm password is required" })
}).superRefine(({ confirmPassword, password }, ctx) => {
  if (confirmPassword !== password) {
    ctx.addIssue({
      code: 'custom',
      message: 'The passwords do not match',
      path: ['confirmPassword'],
    });
  }
});

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const service = searchParams.get("service");
  const ref = searchParams.get("ref");
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: UserRole.PARENT,
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const [res, error] = await RegisterAction(ref ? { ...data, ref } : data);

    if (res) {
      ToastSuccess(res.message);
      router.push(service ? `${ROUTES.AUTH.LOGIN}?service=${service}` : ROUTES.AUTH.LOGIN);
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
                  <Input {...field} type="text" placeholder="Enter your first name"
                    className="focus:ring-2 focus:[#3b5bdb]" />
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
                  <PhoneInput {...field} country={"ng"} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>I am registering as a</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex gap-6"
                  >
                    <label className="flex items-center gap-2 text-sm">
                      <RadioGroupItem value={UserRole.PARENT} />
                      Parent (enrolling a child)
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <RadioGroupItem value={UserRole.STUDENT} />
                      Student (enrolling myself)
                    </label>
                  </RadioGroup>
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

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="relative">
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <PasswordInput {...field} placeholder="Confirm your password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button disabled={form.formState.isSubmitting} type="submit" className="w-full bg-[#3b5bdb] hover:bg-blue-800 text-white transition-colors duration-300">
          {form.formState.isSubmitting && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Register
        </Button>
      </form>
      <div className="text-center text-sm mt-4 space-y-1">
        <p>
          Already have an account?{" "}
          <Link href={ROUTES.AUTH.LOGIN} className="underline underline-offset-4 text-stcblue hover:text-blue-800 transition-colors"
          >
            Log In
          </Link>
        </p>
        <p>
          Want to teach with us?{" "}
          <Link href="/auth/apply-tutor" className="underline underline-offset-4 text-stcblue hover:text-blue-800 transition-colors">
            Apply as a tutor
          </Link>
        </p>
      </div>
    </Form>
  )
}