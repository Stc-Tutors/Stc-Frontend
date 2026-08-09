'use client'

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { ApplyTutorAction } from "@/server/tutor-application";
import { ToastError, ToastSuccess } from "../ui/custom/toast";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { PasswordInput } from "../ui/custom/password-input";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/config/routes";
import { useRouter } from "next/navigation";
import TeachingCombinationPicker from "../teaching-combination-picker";
import { TeachingCombination } from "@/types/curriculum";

const teachingCombinationSchema = z.object({
  serviceType: z.enum(["academic-tutoring", "exam-preparation"]),
  country: z.string(),
  curriculum: z.string(),
  gradeLevel: z.string(),
  subjectsTaught: z.array(z.string()).min(1),
});

const formSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
  confirmPassword: z.string().min(6, { message: "Confirm password is required" }),
  qualifications: z.string().min(1, { message: "Qualifications are required" }),
  yearsOfExperience: z.coerce.number().min(0, { message: "Enter a valid number" }),
  teachingCombinations: z.array(teachingCombinationSchema).min(1, { message: "Add at least one subject" }),
  availability: z.string().min(1, { message: "Describe your availability" }),
  screeningAnswers: z.string().optional(),
}).superRefine(({ confirmPassword, password }, ctx) => {
  if (confirmPassword !== password) {
    ctx.addIssue({ code: "custom", message: "The passwords do not match", path: ["confirmPassword"] });
  }
});

export default function ApplyTutorForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      qualifications: "",
      yearsOfExperience: 0,
      teachingCombinations: [],
      availability: "",
      screeningAnswers: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const [res, error] = await ApplyTutorAction(data);

    if (res) {
      ToastSuccess(res.message);
      router.push(ROUTES.AUTH.LOGIN);
    }
    if (error) {
      ToastError(error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="firstName" render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl><Input {...field} placeholder="First name" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="lastName" render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl><Input {...field} placeholder="Last name" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl><Input {...field} type="email" placeholder="Enter your email" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="phone" render={({ field }) => (
          <FormItem>
            <FormLabel>Phone Number</FormLabel>
            <FormControl><PhoneInput {...field} country={"ng"} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl><PasswordInput {...field} placeholder="Password" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="confirmPassword" render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl><PasswordInput {...field} placeholder="Confirm password" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="qualifications" render={({ field }) => (
          <FormItem>
            <FormLabel>Qualifications</FormLabel>
            <FormControl><Textarea {...field} placeholder="e.g. BSc Mathematics, 5 years classroom teaching..." /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="yearsOfExperience" render={({ field }) => (
          <FormItem>
            <FormLabel>Years of Experience</FormLabel>
            <FormControl><Input {...field} type="number" min={0} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="teachingCombinations" render={({ field }) => (
          <FormItem>
            <FormLabel>Subjects you teach</FormLabel>
            <FormControl>
              <TeachingCombinationPicker
                value={field.value as TeachingCombination[]}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="availability" render={({ field }) => (
          <FormItem>
            <FormLabel>Availability</FormLabel>
            <FormControl><Textarea {...field} placeholder="e.g. Weekdays 4-8pm WAT, weekends flexible" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="screeningAnswers" render={({ field }) => (
          <FormItem>
            <FormLabel>Tell us why you'd be a great tutor (optional)</FormLabel>
            <FormControl><Textarea {...field} placeholder="Anything else we should know?" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <Button disabled={form.formState.isSubmitting} type="submit" className="w-full bg-[#3b5bdb] hover:bg-blue-800 text-white">
          {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Application
        </Button>
      </form>

      <div className="text-center text-sm mt-4">
        Already have an account?{" "}
        <Link href={ROUTES.AUTH.LOGIN} className="underline underline-offset-4 text-stcblue hover:text-blue-800">
          Log In
        </Link>
      </div>
    </Form>
  );
}
