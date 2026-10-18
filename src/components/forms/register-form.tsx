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
  referralCode: z.string().optional(),
  dateOfBirth: z.string().optional(),
  parentEmail: z.string().optional(),
  confirmPassword: z.string().min(1, { message: "Confirm password is required" })
}).superRefine(({ confirmPassword, password, role, dateOfBirth, parentEmail, email }, ctx) => {
  if (confirmPassword !== password) {
    ctx.addIssue({
      code: 'custom',
      message: 'The passwords do not match',
      path: ['confirmPassword'],
    });
  }
  // Same rules the server enforces: under 16 a parent registers the child; 16-17 needs a parent's email to confirm; 18+ is free.
  if (role === UserRole.STUDENT) {
    const age = ageFromDob(dateOfBirth);
    if (age === null) {
      ctx.addIssue({ code: 'custom', message: 'Please enter your date of birth', path: ['dateOfBirth'] });
    } else if (age < 16) {
      ctx.addIssue({ code: 'custom', message: UNDER_16_MESSAGE, path: ['dateOfBirth'] });
    } else if (age < 18) {
      const parent = (parentEmail ?? '').trim();
      if (!z.string().email().safeParse(parent).success) {
        ctx.addIssue({ code: 'custom', message: "Enter your parent or guardian's email address", path: ['parentEmail'] });
      } else if (parent.toLowerCase() === email.trim().toLowerCase()) {
        ctx.addIssue({ code: 'custom', message: "This must be different from your own email", path: ['parentEmail'] });
      }
    }
  }
});

const UNDER_16_MESSAGE =
  "Children under 16 can't create their own account. Please ask a parent or guardian to register as a Parent and add you.";

function ageFromDob(value?: string): number | null {
  if (!value) return null;
  const dob = new Date(value);
  if (Number.isNaN(dob.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  if (now.getMonth() < dob.getMonth() || (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate())) age -= 1;
  return age;
}

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const service = searchParams.get("service");
  const ref = searchParams.get("ref");
  // Set when a parent arrives from a "confirm my child's account" email: they must register as a Parent, then come back to that link.
  const nextParam = searchParams.get("next");
  const next = nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : null;
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
      referralCode: ref ?? "",
      dateOfBirth: "",
      parentEmail: "",
    },
  });
  const role = form.watch("role");
  const dobAge = ageFromDob(form.watch("dateOfBirth"));

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const { referralCode, dateOfBirth, parentEmail, ...rest } = data;
    const studentFields =
      data.role === UserRole.STUDENT
        ? { dateOfBirth, ...(dobAge !== null && dobAge < 18 ? { parentEmail: parentEmail?.trim() } : {}) }
        : {};
    const [res, error] = await RegisterAction({ ...rest, ...studentFields, ...(referralCode ? { ref: referralCode } : {}) });

    if (res) {
      ToastSuccess(res.message);
      const params = new URLSearchParams();
      if (service) params.set("service", service);
      if (next) params.set("next", next);
      if (next) params.set("email", data.email);
      const query = params.toString();
      router.push(query ? `${ROUTES.AUTH.LOGIN}?${query}` : ROUTES.AUTH.LOGIN);
    }
    if (error) {
      // A duplicate-email attempt left them nowhere to go before - now
      // sends them straight to sign in instead of just naming the problem.
      if (error.toLowerCase().includes("email already exists")) {
        ToastError("This email is already registered - please sign in instead.");
        router.push(`${ROUTES.AUTH.LOGIN}?email=${encodeURIComponent(data.email)}`);
      } else {
        ToastError(error);
      }
    }
    form.reset();
  }


  return (
    <Form {...form}>
      <form method="post" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  <PhoneInput value={field.value} onChange={field.onChange} onBlur={field.onBlur} country={"ng"} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {!next && <FormField
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
          />}

          {role === UserRole.STUDENT && (
            <>
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of birth</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" max={new Date().toISOString().slice(0, 10)} />
                    </FormControl>
                    {dobAge !== null && dobAge < 16 && (
                      <p className="text-sm text-red-600">{UNDER_16_MESSAGE}</p>
                    )}
                    {dobAge !== null && dobAge >= 16 && dobAge < 18 && (
                      <p className="text-sm text-gray-600">
                        You&apos;re under 18, so a parent or guardian needs to confirm your account before you can use it.
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              {dobAge !== null && dobAge >= 16 && dobAge < 18 && (
                <FormField
                  control={form.control}
                  name="parentEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent or guardian&apos;s email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="We'll email them a link to confirm your account" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </>
          )}

          <FormField
            control={form.control}
            name="referralCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Referral code (optional)</FormLabel>
                <FormControl>
                  <Input {...field} type="text" placeholder="Have a referral code or link? Enter it here" />
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