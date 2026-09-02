'use client'

import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { RegisterChildAction } from "@/server/auth";
import { ToastError, ToastSuccess } from "../ui/custom/toast";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { PasswordInput } from "../ui/custom/password-input";
import { SearchableCombobox } from "../ui/searchable-combobox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Loader2, Copy } from "lucide-react";
import { childPasswordSchema } from "@/lib/password-policy";
import { GetTaxonomyOptionsAction } from "@/server/taxonomy-option";
import { TaxonomyOptionKind } from "@/types/service-catalog";
import { useSelectedStudent } from "@/contexts/selected-student-context";

const formSchema = z
  .object({
    firstName: z.string().min(1, { message: "First name is required" }),
    lastName: z.string().min(1, { message: "Last name is required" }),
    // Lighter, length-only policy - a young child may need to type this
    // themselves, so no forced character mix. See password-policy.ts.
    password: childPasswordSchema,
    confirmPassword: z.string().min(1, { message: "Confirm password is required" }),
    dateOfBirth: z.string().optional(),
    gender: z.string().optional(),
    // Previously never collected on this quick-add path at all - a child
    // added here, then given a service via Marketplace's "continue
    // enrollment for this child" (which correctly skips re-asking Child Info
    // once a record exists), never had these fields collected anywhere.
    phone: z.string().optional(),
    countryOfResidence: z.string().optional(),
    primaryLanguage: z.string().optional(),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({ code: "custom", message: "The passwords do not match", path: ["confirmPassword"] });
    }
  });

export default function RegisterChildForm() {
  const { refresh: refreshLinkedChildren } = useSelectedStudent();
  const [createdStudentId, setCreatedStudentId] = useState<string | null>(null);
  const [countryOptions, setCountryOptions] = useState<{ label: string; value: string }[]>([]);
  const [languageOptions, setLanguageOptions] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    GetTaxonomyOptionsAction(TaxonomyOptionKind.COUNTRY).then(([res]) =>
      setCountryOptions((res?.data ?? []).map((o) => ({ label: o.label, value: o.value })))
    );
    GetTaxonomyOptionsAction(TaxonomyOptionKind.LANGUAGE).then(([res]) =>
      setLanguageOptions((res?.data ?? []).map((o) => ({ label: o.label, value: o.value })))
    );
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
      dateOfBirth: "",
      gender: "",
      phone: "",
      countryOfResidence: "",
      primaryLanguage: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const { confirmPassword: _confirmPassword, ...payload } = data;
    const [res, error] = await RegisterChildAction(payload);

    if (res?.data) {
      ToastSuccess(res.message);
      setCreatedStudentId(res.data.studentId);
      form.reset();
      // Without this, the shared child list (SelectedStudentProvider) only
      // ever fetched once on mount - a parent who adds a child then
      // navigates to Marketplace via client-side routing (no full page
      // reload) would still see the stale pre-add list, with the new child
      // missing from the "shopping for" switcher entirely.
      refreshLinkedChildren();
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
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender (optional)</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number (optional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Child's phone number" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="countryOfResidence"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country of Residence (optional)</FormLabel>
              <FormControl>
                <SearchableCombobox options={countryOptions} value={field.value ?? ""} onChange={field.onChange} placeholder="Select country" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="primaryLanguage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primary Language (optional)</FormLabel>
              <FormControl>
                <SearchableCombobox options={languageOptions} value={field.value ?? ""} onChange={field.onChange} placeholder="Select language" />
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

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem className="relative">
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <PasswordInput {...field} placeholder="Re-enter the password" />
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
