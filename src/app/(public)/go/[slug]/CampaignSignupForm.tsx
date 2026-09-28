"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchableCombobox } from "@/components/ui/searchable-combobox";
import { Button } from "@/components/ui/button";
import { RegisterForCampaignAction, SigninAction } from "@/server/auth";
import { EnrollAction } from "@/server/enrollment";
import { QuotePricingAction } from "@/server/pricing";
import { GetTaxonomyOptionsAction } from "@/server/taxonomy-option";
import { GetServiceBySlugAction } from "@/server/service-catalog";
import { GetCoursesAction } from "@/server/course";
import { CampaignLandingPage } from "@/types/campaign-landing-page";
import { ITaxonomyOption, TaxonomyOptionKind } from "@/types/service-catalog";
import { UserRole } from "@/types/user";
import { PaymentRequest } from "@/types/payment";
import { Course } from "@/types/course";
import { ROUTES } from "@/config/routes";

interface FormState {
  parentFirstName: string;
  parentLastName: string;
  parentEmail: string;
  parentPhone: string;
  password: string;
  childFullName: string;
  childGender: string;
  childDateOfBirth: string;
  countryOfResidence: string;
  primaryLanguage: string;
}

const EMPTY_FORM: FormState = {
  parentFirstName: "",
  parentLastName: "",
  parentEmail: "",
  parentPhone: "",
  password: "",
  childFullName: "",
  childGender: "",
  childDateOfBirth: "",
  countryOfResidence: "",
  primaryLanguage: "",
};

// One short form replacing the generic multi-step registration wizard for a
// visitor who arrived at a specific campaign's /go/:slug page - the
// service/cohort/age-range are already fixed by the admin (see stcbe's
// ICampaignLandingPage), so there's nothing to pick there. A course is
// usually locked too, but an admin can deliberately leave it unset (e.g. a
// cohort that covers several programs) - in that case a course picker
// appears right after account creation, once GetCoursesAction can actually
// be called (it requires auth, so it can't be shown before signup). Either
// way, submitting silently chains the same steps the wizard already
// performs as separate pages (sign up -> log in -> submit the enrollment ->
// pay via Paystack -> land in the LMS) - no parallel account/enrollment/
// payment logic, just fewer screens.
export default function CampaignSignupForm({ page }: { page: CampaignLandingPage }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [countries, setCountries] = useState<ITaxonomyOption[]>([]);
  const [languages, setLanguages] = useState<ITaxonomyOption[]>([]);
  const [quote, setQuote] = useState<{ amount: number; currency: string } | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(true);
  const [needsCourseChoice, setNeedsCourseChoice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Populated only once signup/login has succeeded and a course still needs
  // picking - the account already exists by then, so "Continue" just resumes
  // straight into enroll + pay rather than repeating signup.
  const [phase, setPhase] = useState<"form" | "choose-course">("form");
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [chosenCourseId, setChosenCourseId] = useState("");

  useEffect(() => {
    Promise.all([
      GetTaxonomyOptionsAction(TaxonomyOptionKind.COUNTRY),
      GetTaxonomyOptionsAction(TaxonomyOptionKind.LANGUAGE),
      QuotePricingAction({ serviceType: page.serviceType, courseId: page.courseId, classGroupId: page.classGroupId }),
      GetServiceBySlugAction(page.serviceType),
    ]).then(([[countryRes], [languageRes], [quoteRes, quoteError], [serviceRes]]) => {
      setCountries(countryRes?.data ?? []);
      setLanguages(languageRes?.data ?? []);
      if (quoteRes?.data) setQuote({ amount: quoteRes.data.amount, currency: quoteRes.data.currency });
      else if (quoteError) setError(quoteError);
      // The admin deliberately left the course unlocked (see the Landing
      // Pages tab) - this service still needs one, just not decided until
      // after the visitor has an account.
      setNeedsCourseChoice(!page.courseId && !!serviceRes?.data?.flowRequirements?.requires_course_selection);
      setIsLoadingQuote(false);
    });
  }, [page.serviceType, page.courseId, page.classGroupId]);

  const countryOptions = countries.map((c) => ({ value: c.value, label: c.label }));
  const languageOptions = languages.map((l) => ({ value: l.value, label: l.label }));

  const handleChange = (patch: Partial<FormState>) => setForm((prev) => ({ ...prev, ...patch }));

  const enrollAndPay = async (courseId?: string) => {
    setStep("Submitting enrollment...");
    const course = availableCourses.find((c) => c.id === courseId);
    const [enrollRes, enrollError] = await EnrollAction({
      fullName: form.childFullName,
      gender: form.childGender,
      dateOfBirth: form.childDateOfBirth,
      phone: form.parentPhone,
      countryOfResidence: form.countryOfResidence,
      primaryLanguage: form.primaryLanguage,
      userType: "parent",
      parentName: `${form.parentFirstName} ${form.parentLastName}`,
      parentEmail: form.parentEmail,
      parentPhone: form.parentPhone,
      serviceDetails: {
        serviceType: page.serviceType,
        courseId: page.courseId || courseId || undefined,
        classGroupId: page.classGroupId,
        ageLevel: page.ageLevel || "",
        learningFocus: page.heading,
        learningGoals: page.heading,
        selectedSubjects: [course?.title || page.title],
        tutorGender: "No preference",
        totalCost: quote?.amount ?? 0,
      },
      schedule: [],
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    if (enrollError || !enrollRes?.data) {
      setError(enrollError || "Could not submit your enrollment.");
      return;
    }

    const { payment } = enrollRes.data;
    if (!payment) {
      router.push(ROUTES.LMS.PARENT.DASHBOARD);
      return;
    }
    if (payment.fullyCoveredByWallet) {
      router.push(ROUTES.LMS.PARENT.PAYMENT_HISTORY);
      return;
    }

    setStep("Opening secure payment...");
    const { default: PaystackPop } = await import("@paystack/inline-js");
    const popup = new PaystackPop();
    popup.resumeTransaction((payment as PaymentRequest).access_code, {
      onSuccess: async () => {
        const { VerifyPaymentAction } = await import("@/server/payment");
        await VerifyPaymentAction((payment as PaymentRequest).reference);
        router.push(ROUTES.LMS.PARENT.PAYMENT_HISTORY);
      },
      onCancel: () => {
        router.push(ROUTES.LMS.PARENT.PAYMENT_HISTORY);
      },
      onError: (popupError: { message?: string }) => {
        setError(popupError?.message || "Payment failed - please try again from Payment History once logged in.");
      },
    });
  };

  const handleSubmit = async () => {
    setError(null);
    if (
      !form.parentFirstName ||
      !form.parentLastName ||
      !form.parentEmail ||
      !form.parentPhone ||
      !form.password ||
      !form.childFullName ||
      !form.childGender ||
      !form.childDateOfBirth ||
      !form.countryOfResidence ||
      !form.primaryLanguage
    ) {
      setError("Please fill in every field");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      setStep("Creating your account...");
      const [, signupError] = await RegisterForCampaignAction(page.slug, {
        firstName: form.parentFirstName,
        lastName: form.parentLastName,
        email: form.parentEmail,
        phone: form.parentPhone,
        role: UserRole.PARENT,
        password: form.password,
      });
      if (signupError) {
        setError(signupError);
        return;
      }

      setStep("Signing you in...");
      const [signinRes, signinError] = await SigninAction({ email: form.parentEmail, password: form.password });
      if (signinError || !signinRes?.data?.token) {
        setError(signinError || "Could not sign you in - please try logging in manually.");
        return;
      }

      if (needsCourseChoice) {
        setStep("Loading courses...");
        const [coursesRes, coursesError] = await GetCoursesAction({ serviceType: page.serviceType });
        const courses = coursesRes?.data ?? [];
        if (coursesError || courses.length === 0) {
          setError(coursesError || "No courses are available for this program right now - please contact us.");
          return;
        }
        if (courses.length === 1) {
          await enrollAndPay(courses[0].id);
          return;
        }
        setAvailableCourses(courses);
        setPhase("choose-course");
        return;
      }

      await enrollAndPay();
    } catch {
      setError("Something went wrong - please try again.");
    } finally {
      setIsSubmitting(false);
      setStep(null);
    }
  };

  const handleConfirmCourse = async () => {
    if (!chosenCourseId) {
      setError("Please choose a course");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await enrollAndPay(chosenCourseId);
    } catch {
      setError("Something went wrong - please try again.");
    } finally {
      setIsSubmitting(false);
      setStep(null);
    }
  };

  if (phase === "choose-course") {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6 space-y-4">
        <div>
          <p className="text-sm text-gray-500">Price</p>
          <p className="text-2xl font-bold text-gray-900">
            {quote ? `${quote.currency} ${quote.amount.toLocaleString()}` : "Contact us"}
          </p>
        </div>
        <p className="text-sm text-gray-700">Your account is ready - now pick which course to enroll in:</p>
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>}
        <div className="space-y-2">
          {availableCourses.map((c) => (
            <label
              key={c.id}
              className={`flex items-center gap-2 border rounded-md px-3 py-2 text-sm cursor-pointer ${
                chosenCourseId === c.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
              }`}
            >
              <input
                type="radio"
                name="course"
                checked={chosenCourseId === c.id}
                onChange={() => setChosenCourseId(c.id)}
              />
              {c.title}
            </label>
          ))}
        </div>
        <Button className="w-full" size="lg" onClick={handleConfirmCourse} disabled={isSubmitting}>
          {isSubmitting ? step || "Please wait..." : "Continue to payment"}
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6 space-y-4">
      <div>
        <p className="text-sm text-gray-500">Price</p>
        <p className="text-2xl font-bold text-gray-900">
          {isLoadingQuote ? "Loading..." : quote ? `${quote.currency} ${quote.amount.toLocaleString()}` : "Contact us"}
        </p>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>}

      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Your details</p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>First name</Label>
            <Input value={form.parentFirstName} onChange={(e) => handleChange({ parentFirstName: e.target.value })} />
          </div>
          <div>
            <Label>Last name</Label>
            <Input value={form.parentLastName} onChange={(e) => handleChange({ parentLastName: e.target.value })} />
          </div>
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" value={form.parentEmail} onChange={(e) => handleChange({ parentEmail: e.target.value })} />
        </div>
        <div>
          <Label>Phone</Label>
          <Input value={form.parentPhone} onChange={(e) => handleChange({ parentPhone: e.target.value })} />
        </div>
        <div>
          <Label>Choose a password</Label>
          <Input type="password" value={form.password} onChange={(e) => handleChange({ password: e.target.value })} placeholder="At least 8 characters" />
        </div>

        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-2">Your child&apos;s details</p>
        <div>
          <Label>Full name</Label>
          <Input value={form.childFullName} onChange={(e) => handleChange({ childFullName: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Gender</Label>
            <Select value={form.childGender} onValueChange={(value) => handleChange({ childGender: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Date of birth</Label>
            <Input type="date" value={form.childDateOfBirth} onChange={(e) => handleChange({ childDateOfBirth: e.target.value })} />
          </div>
        </div>
        <div>
          <Label>Country of residence</Label>
          <SearchableCombobox
            options={countryOptions}
            value={form.countryOfResidence}
            onChange={(value) => handleChange({ countryOfResidence: value })}
            placeholder="Select country"
          />
        </div>
        <div>
          <Label>Primary language</Label>
          <SearchableCombobox
            options={languageOptions}
            value={form.primaryLanguage}
            onChange={(value) => handleChange({ primaryLanguage: value })}
            placeholder="Select language"
          />
        </div>
      </div>

      <Button className="w-full" size="lg" onClick={handleSubmit} disabled={isSubmitting || isLoadingQuote}>
        {isSubmitting ? step || "Please wait..." : page.ctaLabel}
      </Button>
      <p className="text-xs text-gray-400 text-center">
        Creates your STC Tutors account{needsCourseChoice ? ", then a quick course pick, " : " and takes you straight "}
        to secure payment.
      </p>
    </div>
  );
}
