"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { ChevronRight, Loader2, MailCheck, UserRound, Users } from "lucide-react";

import { EnrollmentProvider, useEnrollment } from "@/contexts/enrollment-context";
import { IntakeGate } from "@/components/intake-closed";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/custom/password-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ToastError, ToastSuccess } from "@/components/ui/custom/toast";
import { AcceptTermsAction, EnrollSignupAction } from "@/server/auth";
import { passwordSchema } from "@/lib/password-policy";
import { ROUTES } from "@/config/routes";
import { UserRole } from "@/types/user";

const EnrollmentFlow = dynamic(() => import("@/components/enrollment-flow"), { ssr: false });

export interface EnrollAccount {
  role: UserRole;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  termsAccepted: boolean;
}

// The account step comes before the wizard's own 4 steps.
const ACCOUNT_STEPS = 1;
const TOTAL_STEPS = 4 + ACCOUNT_STEPS;
const COMPLETE_PATH = "/enroll/complete";

const UNDER_16_MESSAGE =
  "Learners under 16 are enrolled by a parent or guardian. Choose \"I'm a parent\" above and add the learner in the next step.";

function ageFromDob(value?: string): number | null {
  if (!value) return null;
  const dob = new Date(value);
  if (Number.isNaN(dob.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  if (now.getMonth() < dob.getMonth() || (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate())) age -= 1;
  return age;
}

const schema = z
  .object({
    role: z.enum([UserRole.PARENT, UserRole.STUDENT]),
    firstName: z.string().trim().min(1, { message: "First name is required" }),
    lastName: z.string().trim().min(1, { message: "Last name is required" }),
    email: z.string().trim().email({ message: "Enter a valid email address" }),
    phone: z.string().min(10, { message: "Enter a valid phone number" }),
    password: passwordSchema,
    dateOfBirth: z.string().optional(),
    parentEmail: z.string().optional(),
    referralCode: z.string().optional(),
    acceptTerms: z.boolean().refine((v) => v, { message: "Please agree to the Terms to continue" }),
  })
  .superRefine(({ role, dateOfBirth, parentEmail, email }, ctx) => {
    if (role !== UserRole.STUDENT) return;
    const age = ageFromDob(dateOfBirth);
    if (age === null) {
      ctx.addIssue({ code: "custom", message: "Please enter your date of birth", path: ["dateOfBirth"] });
    } else if (age < 16) {
      ctx.addIssue({ code: "custom", message: UNDER_16_MESSAGE, path: ["dateOfBirth"] });
    } else if (age < 18) {
      const parent = (parentEmail ?? "").trim();
      if (!z.string().email().safeParse(parent).success) {
        ctx.addIssue({ code: "custom", message: "Enter your parent or guardian's email", path: ["parentEmail"] });
      } else if (parent.toLowerCase() === email.trim().toLowerCase()) {
        ctx.addIssue({ code: "custom", message: "This must be different from your own email", path: ["parentEmail"] });
      }
    }
  });

type FormValues = z.infer<typeof schema>;

function StepHeader({ step, title }: { step: number; title: string }) {
  return (
    <div className="mb-8 space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Enrol in a few minutes</h1>
      <div className="space-y-2">
        <div className="flex justify-between flex-wrap gap-2 text-sm text-gray-600">
          <span>
            Step {step} of {TOTAL_STEPS}
          </span>
          <span>{title}</span>
        </div>
        <Progress value={(step / TOTAL_STEPS) * 100} className="h-2" />
      </div>
    </div>
  );
}

function AccountStep({ referralCode, onDone }: { referralCode?: string; onDone: (account: EnrollAccount) => void }) {
  const [showReferral, setShowReferral] = useState(!!referralCode);
  const [consentPendingFor, setConsentPendingFor] = useState<string | null>(null);
  const [existingEmail, setExistingEmail] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const service = searchParams.get("service");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: UserRole.PARENT,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      dateOfBirth: "",
      parentEmail: "",
      referralCode: referralCode ?? "",
      acceptTerms: false,
    },
  });
  const role = form.watch("role");
  const age = ageFromDob(form.watch("dateOfBirth"));

  const onSubmit = async (values: FormValues) => {
    setExistingEmail(null);
    const isStudent = values.role === UserRole.STUDENT;
    const [res, error] = await EnrollSignupAction({
      role: values.role,
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      phone: values.phone,
      password: values.password,
      ...(isStudent ? { dateOfBirth: values.dateOfBirth } : {}),
      ...(isStudent && age !== null && age < 18 ? { parentEmail: values.parentEmail?.trim() } : {}),
      ...(values.referralCode?.trim() ? { ref: values.referralCode.trim() } : {}),
    });

    if (error || !res?.data) {
      if ((error ?? "").toLowerCase().includes("email already exists")) {
        setExistingEmail(values.email.trim());
      } else {
        ToastError(error || "We couldn't create your account. Please try again.");
      }
      return;
    }

    if (res.data.consentPending) {
      setConsentPendingFor(values.parentEmail?.trim() || "your parent or guardian");
      return;
    }

    // Recorded here because the site-wide Terms pop-up only runs inside the LMS, and enrolling is refused until it is accepted.
    const [, termsError] = await AcceptTermsAction();
    if (termsError) ToastError("We couldn't record your agreement to the Terms - you'll be asked again before paying.");

    ToastSuccess("Account created - we've emailed you a link to verify it. You can carry on in the meantime.");
    onDone({
      role: values.role,
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      phone: values.phone,
      dateOfBirth: isStudent ? values.dateOfBirth ?? "" : "",
      termsAccepted: !termsError,
    });
  };

  if (consentPendingFor) {
    return (
      <Card>
        <CardContent className="py-10 text-center space-y-4">
          <MailCheck className="mx-auto size-10 text-[#0a7ac2]" aria-hidden />
          <h2 className="text-lg font-semibold">Almost there</h2>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Because you&apos;re under 18, we&apos;ve emailed {consentPendingFor} to confirm your account. Once they have, sign in to
            finish enrolling.
          </p>
          <Link href={ROUTES.AUTH.LOGIN} className="inline-block underline underline-offset-4 text-sm text-[#0a7ac2]">
            Go to sign in
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your account</CardTitle>
        <p className="text-sm text-gray-600">
          Already have one?{" "}
          <Link
            href={service ? `${ROUTES.AUTH.LOGIN}?service=${encodeURIComponent(service)}` : ROUTES.AUTH.LOGIN}
            className="underline underline-offset-4 text-[#0a7ac2]"
          >
            Sign in
          </Link>
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Who is this enrolment for?</FormLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup">
                    {[
                      { value: UserRole.PARENT, label: "My child", hint: "I'm a parent or guardian", Icon: Users },
                      { value: UserRole.STUDENT, label: "Myself", hint: "I'm the learner", Icon: UserRound },
                    ].map(({ value, label, hint, Icon }) => {
                      const selected = field.value === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => field.onChange(value)}
                          className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a7ac2] ${
                            selected ? "border-[#0a7ac2] bg-blue-50" : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <Icon className={`size-5 shrink-0 ${selected ? "text-[#0a7ac2]" : "text-gray-500"}`} aria-hidden />
                          <span>
                            <span className="block text-sm font-medium text-gray-900">{label}</span>
                            <span className="block text-xs text-gray-500">{hint}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{role === UserRole.PARENT ? "Your first name" : "First name"}</FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="given-name" />
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
                    <FormLabel>{role === UserRole.PARENT ? "Your last name" : "Last name"}</FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="family-name" />
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
                      <Input {...field} type="email" autoComplete="email" />
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
                    <FormLabel>Phone number</FormLabel>
                    <FormControl>
                      <PhoneInput value={field.value} onChange={field.onChange} onBlur={field.onBlur} country="ng" inputStyle={{ width: "100%" }} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {role === UserRole.STUDENT && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of birth</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" max={new Date().toISOString().slice(0, 10)} />
                      </FormControl>
                      {age !== null && age >= 16 && age < 18 && (
                        <p className="text-xs text-gray-600">You&apos;re under 18, so a parent or guardian confirms your account first.</p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {age !== null && age >= 16 && age < 18 && (
                  <FormField
                    control={form.control}
                    name="parentEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent or guardian&apos;s email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Create a password</FormLabel>
                  <FormControl>
                    <PasswordInput {...field} autoComplete="new-password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showReferral ? (
              <FormField
                control={form.control}
                name="referralCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Referral code</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <button type="button" onClick={() => setShowReferral(true)} className="text-sm text-[#0a7ac2] underline underline-offset-4">
                Have a referral code?
              </button>
            )}

            <FormField
              control={form.control}
              name="acceptTerms"
              render={({ field }) => (
                <FormItem>
                  <label className="flex items-start gap-2 text-sm text-gray-700">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} className="mt-0.5" />
                    </FormControl>
                    <span>
                      I agree to the{" "}
                      <Link href="/terms" target="_blank" className="underline underline-offset-4 text-[#0a7ac2]">
                        Terms &amp; Conditions
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" target="_blank" className="underline underline-offset-4 text-[#0a7ac2]">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                  <FormMessage />
                </FormItem>
              )}
            />

            {existingEmail && (
              <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                {existingEmail} already has an account.{" "}
                <Link
                  href={`${ROUTES.AUTH.LOGIN}?email=${encodeURIComponent(existingEmail)}${service ? `&service=${encodeURIComponent(service)}` : ""}`}
                  className="underline underline-offset-4 font-medium"
                >
                  Sign in to enrol
                </Link>
              </p>
            )}

            <Button type="submit" disabled={form.formState.isSubmitting} className="w-full sm:w-auto bg-[#0a7ac2] hover:bg-[#08629c] text-white">
              {form.formState.isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" aria-hidden /> : null}
              Continue
              <ChevronRight className="ml-1 size-4" aria-hidden />
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// Puts what the account step already collected into the learner step, so a
// self-enrolling student doesn't retype their name/birth date and a parent
// doesn't retype their phone. Runs before the wizard mounts (its steps seed
// their fields once, on mount). Skipped when resuming a saved draft, which
// carries its own details.
function PrefilledFlow({ account }: { account: EnrollAccount }) {
  const { updateChildInfo } = useEnrollment();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const forcedUserType = account.role === UserRole.STUDENT ? "student" : "parent";

  useEffect(() => {
    if (!searchParams.get("continue")) {
      updateChildInfo(
        forcedUserType === "student"
          ? { userType: "student", fullName: `${account.firstName} ${account.lastName}`.trim(), phone: account.phone, dateOfBirth: account.dateOfBirth }
          : { userType: "parent", phone: account.phone }
      );
    }
    queueMicrotask(() => setReady(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ready) return null;
  return (
    <EnrollmentFlow forcedUserType={forcedUserType} dashboardPath={COMPLETE_PATH} paymentHistoryPath={COMPLETE_PATH} leadingSteps={ACCOUNT_STEPS} />
  );
}

function TermsCatchUp({ onAccepted }: { onAccepted: () => void }) {
  const [agreed, setAgreed] = useState(false);
  const [saving, setSaving] = useState(false);
  return (
    <div className="w-full flex-1 bg-gray-50 py-8">
      <div className="max-w-xl mx-auto px-4">
        <Card>
          <CardContent className="py-8 space-y-4">
            <p className="text-sm text-gray-700">Before you carry on, please agree to our terms.</p>
            <label className="flex items-start gap-2 text-sm text-gray-700">
              <Checkbox checked={agreed} onCheckedChange={(c) => setAgreed(c === true)} className="mt-0.5" />
              <span>
                I agree to the{" "}
                <Link href="/terms" target="_blank" className="underline underline-offset-4 text-[#0a7ac2]">
                  Terms &amp; Conditions
                </Link>
              </span>
            </label>
            <Button
              disabled={!agreed || saving}
              className="bg-[#0a7ac2] hover:bg-[#08629c] text-white"
              onClick={async () => {
                setSaving(true);
                const [, error] = await AcceptTermsAction();
                setSaving(false);
                if (error) ToastError(error);
                else onAccepted();
              }}
            >
              {saving ? <Loader2 className="mr-2 size-4 animate-spin" aria-hidden /> : null}
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function EnrollStart({
  initialAccount,
  service,
  referralCode,
}: {
  initialAccount: EnrollAccount | null;
  service?: string;
  referralCode?: string;
}) {
  const [account, setAccount] = useState<EnrollAccount | null>(initialAccount);

  if (!account) {
    return (
      <IntakeGate targets={["PARENT_SIGNUP", "STUDENT_SIGNUP"]} closedAll>
        <main className="w-full flex-1 bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <StepHeader step={1} title="Your account" />
            <AccountStep referralCode={referralCode} onDone={setAccount} />
            {service ? null : (
              <p className="mt-4 text-xs text-gray-500">Next you&apos;ll choose a service, the learner, subjects and class times, then pay.</p>
            )}
          </div>
        </main>
      </IntakeGate>
    );
  }

  if (!account.termsAccepted) {
    return <TermsCatchUp onAccepted={() => setAccount({ ...account, termsAccepted: true })} />;
  }

  return (
    <IntakeGate targets={["ENROLLMENT"]} backHref="/">
      <main>
        <EnrollmentProvider>
          <PrefilledFlow account={account} />
        </EnrollmentProvider>
      </main>
    </IntakeGate>
  );
}
