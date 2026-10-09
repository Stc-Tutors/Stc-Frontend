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
import { GetCurriculumChildrenAction, GetCurriculumNodeAction } from "@/server/curriculum";
import { GetCoursesAction } from "@/server/course";
import { ValidateCouponAction } from "@/server/coupon";
import { ApplyReferralCodeAction } from "@/server/referral";
import PaymentConsentModal from "@/components/payment-consent-modal";
import { isValidPassword, PASSWORD_POLICY_MESSAGE } from "@/lib/password-policy";
import { CampaignLandingPage } from "@/types/campaign-landing-page";
import { ITaxonomyOption, TaxonomyOptionKind } from "@/types/service-catalog";
import { CurriculumNode, CurriculumNodeType } from "@/types/curriculum";
import { UserRole } from "@/types/user";
import { PaymentRequest } from "@/types/payment";
import { Course } from "@/types/course";
import { ROUTES } from "@/config/routes";
import { APPLY_COUPON_EVENT } from "@/lib/campaign-promo";
import { WhatsAppLink } from "./WhatsAppButtons";
import { trackMetaEvent } from "@/lib/meta-pixel";
import { LocalPriceNote, LocalFirstPrice } from "@/components/local-price-note";

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
  couponCode: string;
  referralCode: string;
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
  couponCode: "",
  referralCode: "",
};

// Placeholder while a price is being fetched - same footprint as the price
// line, so the form doesn't jump when it arrives.
function PriceSkeleton() {
  return <div className="h-8 w-44 rounded-md bg-gray-200 animate-pulse" role="status" aria-label="Loading price" />;
}

// Shown instead of a price when the quote request failed.
function PriceError({ onRetry, pageName }: { onRetry: () => void; pageName: string }) {
  return (
    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 space-y-1">
      <p>We couldn&apos;t load the price just now.</p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <button type="button" onClick={onRetry} className="font-semibold underline">Try again</button>
        <WhatsAppLink pageName={pageName} label="Ask us on WhatsApp" />
      </div>
    </div>
  );
}

function formatMoney(currency?: string, amount?: number) {
  if (amount == null) return "";
  return `${currency ?? "NGN"} ${amount.toLocaleString()}`;
}

interface EnrollChoice {
  courseId?: string;
  taxonomyNodeId?: string;
  // Only relevant for services whose flowRequirements.requires_age_range is
  // true (e.g. tech-bootcamp) - StudentService.assertServiceDetailsSatisfyFlowRequirements
  // checks this as a plain string, completely independent of
  // selectedSubjectNodeIds, so picking a node under an Age Range branch of
  // the flow tree does NOT by itself satisfy it.
  ageLevel?: string;
  label: string;
  amount: number;
  currency: string;
}

// One short form replacing the generic multi-step registration wizard for a
// visitor who arrived at a specific campaign's /go/:slug page - the
// service/cohort are already fixed by the admin (see stcbe's
// ICampaignLandingPage). Enrollment then goes one of two ways, per the
// page's own pricingMode:
//  - FLOW_TREE (the default): the visitor drills through the service's
//    curriculum tree directly on this page - public data, so it (and its
//    live per-leaf pricing) can happen before signup, no Course involved.
//  - COURSE: enrolls into a full Course. Course browsing needs auth, so an
//    unlocked course only gets picked right after silent signup/login.
// Either way, submitting silently chains the same steps the wizard already
// performs as separate pages (sign up -> log in -> submit the enrollment ->
// pay via Paystack -> land in the LMS) - no parallel account/enrollment/
// payment logic, just fewer screens.
//
// One child per submission: enrollment, pricing, coupon redemption and the
// Paystack charge are all per-child on the backend, so the form points a
// family with several children at WhatsApp rather than faking it here.
export default function CampaignSignupForm({ page, cohortName }: { page: CampaignLandingPage; cohortName: string }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [countries, setCountries] = useState<ITaxonomyOption[]>([]);
  const [languages, setLanguages] = useState<ITaxonomyOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // "Before you pay" consent, shown once the account exists and a specific
  // choice (course/subject + price) is settled - same gate the main
  // registration wizard uses (PaymentConsentModal), just reached via one
  // continuous form instead of a multi-step review page.
  const [pendingChoice, setPendingChoice] = useState<EnrollChoice | null>(null);
  const [showConsent, setShowConsent] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  // --- FLOW_TREE mode: public, so this all happens before signup ---
  const [flowTreePath, setFlowTreePath] = useState<CurriculumNode[]>([]);
  const [flowTreeOptions, setFlowTreeOptions] = useState<CurriculumNode[]>([]);
  const [flowTreeLeaf, setFlowTreeLeaf] = useState<CurriculumNode | null>(null);
  const [flowTreeQuote, setFlowTreeQuote] = useState<{ amount: number; currency: string } | null>(null);
  const [isLoadingFlowTreeStep, setIsLoadingFlowTreeStep] = useState(false);

  // --- COURSE mode: course browsing needs auth, so it's deferred ---
  const [quote, setQuote] = useState<{ amount: number; currency: string } | null>(null);
  const [needsCourseChoice, setNeedsCourseChoice] = useState(false);
  const [phase, setPhase] = useState<"form" | "choose-course">("form");
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [chosenCourseId, setChosenCourseId] = useState("");

  // Set when a price fetch fails, so the price area shows a retry instead of a
  // loading state that never ends.
  const [priceError, setPriceError] = useState<string | null>(null);

  const isFlowTree = page.pricingMode !== "COURSE";

  // The price is resolved server-side from the visitor's IP/country (and any
  // currency the Super Admin assigned to that country), so it is already in the
  // visitor's currency wherever Price Management and the payment gateway support it.
  const fetchFlowTreeQuote = async (nodeId: string) => {
    setPriceError(null);
    setFlowTreeQuote(null);
    const [quoteRes, quoteError] = await QuotePricingAction({
      serviceType: page.serviceType,
      taxonomyNodeId: nodeId,
      classGroupId: page.classGroupId,
    });
    if (quoteRes?.data) setFlowTreeQuote({ amount: quoteRes.data.amount, currency: quoteRes.data.currency });
    else setPriceError(quoteError || "Could not load the price.");
  };

  const fetchCourseQuote = async () => {
    setPriceError(null);
    setQuote(null);
    const [quoteRes, quoteError] = await QuotePricingAction({
      serviceType: page.serviceType,
      courseId: page.courseId,
      classGroupId: page.classGroupId,
    });
    if (quoteRes?.data) setQuote({ amount: quoteRes.data.amount, currency: quoteRes.data.currency });
    else setPriceError(quoteError || "Could not load the price.");
  };

  const handleRetryPrice = async () => {
    if (isFlowTree && flowTreeLeaf) await fetchFlowTreeQuote(flowTreeLeaf.id);
    else if (!isFlowTree && page.courseId) await fetchCourseQuote();
  };

  // "Tap to copy" on the offer banner also drops the code into the coupon field.
  useEffect(() => {
    const onApply = (e: Event) => {
      const code = (e as CustomEvent<string>).detail;
      if (typeof code === "string") setForm((prev) => ({ ...prev, couponCode: code }));
    };
    window.addEventListener(APPLY_COUPON_EVENT, onApply);
    return () => window.removeEventListener(APPLY_COUPON_EVENT, onApply);
  }, []);

  useEffect(() => {
    Promise.all([GetTaxonomyOptionsAction(TaxonomyOptionKind.COUNTRY), GetTaxonomyOptionsAction(TaxonomyOptionKind.LANGUAGE)]).then(
      ([[countryRes], [languageRes]]) => {
        setCountries(countryRes?.data ?? []);
        setLanguages(languageRes?.data ?? []);
      }
    );

    if (isFlowTree) {
      (async () => {
        if (page.taxonomyNodeId) {
          const [[lockedRes], [childrenRes]] = await Promise.all([
            GetCurriculumNodeAction(page.taxonomyNodeId),
            GetCurriculumChildrenAction(page.taxonomyNodeId, page.serviceType),
          ]);
          const locked = lockedRes?.data;
          const children = childrenRes?.data ?? [];
          if (locked && children.length > 0) {
            setFlowTreePath([locked]);
            setFlowTreeOptions(children);
          } else if (locked) {
            // The lock is itself a leaf - nothing to pick, price it directly.
            setFlowTreeLeaf(locked);
            await fetchFlowTreeQuote(locked.id);
          }
        } else {
          const [res] = await GetCurriculumChildrenAction(null, page.serviceType);
          setFlowTreeOptions(res?.data ?? []);
        }
        setIsLoading(false);
      })();
    } else {
      (async () => {
        setNeedsCourseChoice(!page.courseId);
        if (page.courseId) await fetchCourseQuote();
        setIsLoading(false);
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.serviceType, page.courseId, page.taxonomyNodeId, page.classGroupId, page.pricingMode]);

  const countryOptions = countries.map((c) => ({ value: c.value, label: c.label }));
  const languageOptions = languages.map((l) => ({ value: l.value, label: l.label }));

  const handleChange = (patch: Partial<FormState>) => setForm((prev) => ({ ...prev, ...patch }));

  const canGoBackInTree = page.taxonomyNodeId ? flowTreePath.length > 1 : flowTreePath.length > 0;

  const handlePickFlowTreeNode = async (node: CurriculumNode) => {
    setError(null);
    setPriceError(null);
    setIsLoadingFlowTreeStep(true);
    setFlowTreeLeaf(null);
    setFlowTreeQuote(null);
    const [childrenRes] = await GetCurriculumChildrenAction(node.id, page.serviceType);
    const children = childrenRes?.data ?? [];
    if (children.length > 0) {
      setFlowTreePath((prev) => [...prev, node]);
      setFlowTreeOptions(children);
    } else {
      setFlowTreeLeaf(node);
      await fetchFlowTreeQuote(node.id);
    }
    setIsLoadingFlowTreeStep(false);
  };

  const handleBackInTree = async () => {
    if (!canGoBackInTree) return;
    setError(null);
    setPriceError(null);
    setIsLoadingFlowTreeStep(true);
    const newPath = flowTreePath.slice(0, -1);
    const parentNode = newPath[newPath.length - 1];
    const parentId = parentNode ? parentNode.id : page.taxonomyNodeId ?? null;
    const [res] = await GetCurriculumChildrenAction(parentId, page.serviceType);
    setFlowTreePath(newPath);
    setFlowTreeOptions(res?.data ?? []);
    setFlowTreeLeaf(null);
    setFlowTreeQuote(null);
    setIsLoadingFlowTreeStep(false);
  };

  // Actually creates the enrollment and opens Paystack - only ever called
  // after the parent has agreed to PaymentConsentModal (see requestPayment).
  const submitEnrollment = async (choice: EnrollChoice) => {
    setStep("Submitting enrollment...");
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
      // Redeemed server-side against the server's own recomputed price
      // (StudentService.computeEnrollmentQuote) - an invalid/expired/
      // exhausted code throws and aborts the enrollment, which is why this
      // is validated (see handleSubmit) before ever reaching here.
      couponCode: form.couponCode.trim() || undefined,
      serviceDetails: {
        serviceType: page.serviceType,
        courseId: choice.courseId,
        classGroupId: page.classGroupId,
        learningFocus: page.heading,
        learningGoals: page.heading,
        selectedSubjects: [choice.label],
        selectedSubjectNodeIds: choice.taxonomyNodeId ? [choice.taxonomyNodeId] : undefined,
        ageLevel: choice.ageLevel,
        tutorGender: "No preference",
        totalCost: choice.amount,
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
      trackMetaEvent("Purchase", { value: choice.amount, currency: choice.currency });
      router.push(ROUTES.LMS.PARENT.PAYMENT_HISTORY);
      return;
    }

    setStep("Opening secure payment...");
    const { default: PaystackPop } = await import("@paystack/inline-js");
    const popup = new PaystackPop();
    popup.resumeTransaction((payment as PaymentRequest).access_code, {
      onSuccess: async () => {
        const { VerifyPaymentAction } = await import("@/server/payment");
        const [verifyRes] = await VerifyPaymentAction((payment as PaymentRequest).reference);
        // Only count a payment that actually verified. The amount is the price
        // quoted on this page (before any coupon discount).
        if (verifyRes?.data?.status === "COMPLETED") trackMetaEvent("Purchase", { value: choice.amount, currency: choice.currency });
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

  const requestPayment = (choice: EnrollChoice) => {
    setPendingChoice(choice);
    setShowConsent(true);
  };

  const handleAgreeToPay = async () => {
    if (!pendingChoice) return;
    setIsPaying(true);
    try {
      await submitEnrollment(pendingChoice);
    } finally {
      setIsPaying(false);
      setShowConsent(false);
    }
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
    // Both are how the team reaches the family, so they are checked on their own with a specific message.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.parentEmail.trim())) {
      setError("Please enter a valid email address");
      return;
    }
    if (form.parentPhone.replace(/\D/g, "").length < 7) {
      setError("Please enter a valid phone number, including the country code");
      return;
    }
    if (isFlowTree && !flowTreeLeaf) {
      setError("Please choose from the list");
      return;
    }
    // A price that hasn't arrived (or failed) would otherwise be submitted as 0.
    if ((isFlowTree && flowTreeLeaf && !flowTreeQuote) || (!isFlowTree && page.courseId && !quote)) {
      setError(priceError ? "We couldn't load the price - please retry it before continuing." : "The price is still loading - one moment.");
      return;
    }
    if (!isValidPassword(form.password)) {
      setError(PASSWORD_POLICY_MESSAGE);
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
      // An earlier attempt on this exact page can fail partway through
      // (network drop, a later step erroring) after the account itself was
      // already created - retrying now auto-signs-in with whatever email/
      // password was just typed; if that's the same family retrying, it
      // just works and the flow continues. Only a genuine mismatch (someone
      // else's email, or a mistyped password) falls through to sign-in.
      if (signupError) {
        if (!signupError.toLowerCase().includes("email already exists")) {
          setError(signupError);
          return;
        }
        setStep("This email already has an account - signing you in...");
        const [retryRes, retryError] = await SigninAction({ email: form.parentEmail, password: form.password });
        if (retryError || !retryRes?.data?.token) {
          setError("This email is already registered. Please sign in instead, then continue from your dashboard.");
          router.push(`${ROUTES.AUTH.LOGIN}?email=${encodeURIComponent(form.parentEmail)}`);
          return;
        }
        // The matched account might not be a family account at all (e.g. an
        // existing tutor's own login) - enrolling would just fail server-side
        // with a confusing generic permissions error, so catch it here with a
        // message that actually explains what's wrong.
        const existingRole = retryRes.data.user.role;
        if (existingRole !== UserRole.PARENT && existingRole !== UserRole.STUDENT) {
          setError(
            `This email already has a ${existingRole.toLowerCase()} account on our platform, which can't be used to enroll a child here - please use a different email address.`
          );
          return;
        }
      } else {
        // A brand-new account was just created from this ad landing page.
        trackMetaEvent("Lead");
        setStep("Signing you in...");
        const [signinRes, signinError] = await SigninAction({ email: form.parentEmail, password: form.password });
        if (signinError || !signinRes?.data?.token) {
          setError(signinError || "Could not sign you in - please try logging in manually.");
          return;
        }
      }

      // Referral attribution (who gets credited if this family ever pays) is
      // separate from a coupon (a discount on this specific charge) - see
      // ReferralService.applyReferralCode vs CouponService.redeem. Applying
      // the referral code is best-effort: an already-referred account or a
      // bad code here shouldn't block payment, it just means no one gets
      // attributed for this signup.
      if (form.referralCode.trim()) {
        setStep("Applying referral code...");
        await ApplyReferralCodeAction(form.referralCode.trim());
      }

      // Unlike the referral code, an invalid/expired/exhausted coupon THROWS
      // and aborts the whole enrollment if sent as-is (CouponService.redeem
      // actually consumes it at submit time) - so it's checked here first,
      // with a clear error the family can act on, rather than surfacing that
      // failure after they've already gone through the payment consent step.
      if (form.couponCode.trim()) {
        setStep("Checking coupon code...");
        const previewAmount = isFlowTree ? flowTreeQuote?.amount ?? 0 : quote?.amount ?? 0;
        const [, couponError] = await ValidateCouponAction(form.couponCode.trim(), previewAmount);
        if (couponError) {
          setError(couponError);
          return;
        }
      }

      if (isFlowTree) {
        // Both the pick and the price were already resolved above, before
        // signup - nothing left to do but submit. Age Range is only ever the
        // tree's root stage (see stcbe's AGE_RANGE_STAGE) or the locked
        // starting node itself, so it's whichever of those is an AGE_RANGE
        // node; a leaf-locked page with no Age Range in its path at all has
        // no age to report, which is fine for services that don't need one.
        const ageLevel =
          flowTreePath.find((n) => n.type === CurriculumNodeType.AGE_RANGE)?.name ??
          (flowTreeLeaf?.type === CurriculumNodeType.AGE_RANGE ? flowTreeLeaf.name : undefined);
        requestPayment({
          taxonomyNodeId: flowTreeLeaf!.id,
          label: flowTreeLeaf!.name,
          amount: flowTreeQuote?.amount ?? 0,
          currency: flowTreeQuote?.currency ?? "NGN",
          ageLevel,
        });
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
          requestPayment({ courseId: courses[0].id, label: courses[0].title, amount: courses[0].price, currency: courses[0].currency });
          return;
        }
        setAvailableCourses(courses);
        setPhase("choose-course");
        return;
      }

      requestPayment({
        courseId: page.courseId,
        label: page.title,
        amount: quote?.amount ?? 0,
        currency: quote?.currency ?? "NGN",
      });
    } catch {
      setError("Something went wrong - please try again.");
    } finally {
      setIsSubmitting(false);
      setStep(null);
    }
  };

  const handleConfirmCourse = () => {
    const course = availableCourses.find((c) => c.id === chosenCourseId);
    if (!course) {
      setError("Please choose a course");
      return;
    }
    setError(null);
    requestPayment({ courseId: course.id, label: course.title, amount: course.price, currency: course.currency });
  };

  if (phase === "choose-course") {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 md:sticky md:top-6 space-y-4">
        <p className="text-lg font-bold text-gray-900 leading-snug">{cohortName}</p>
        <p className="text-sm text-gray-700">Your account is ready - now pick which course to enroll in:</p>
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>}
        <div className="space-y-2">
          {availableCourses.map((c) => (
            <label
              key={c.id}
              className={`flex items-center justify-between gap-2 border rounded-md px-3 py-2 text-sm cursor-pointer ${
                chosenCourseId === c.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
              }`}
            >
              <span className="flex items-center gap-2">
                <input type="radio" name="course" checked={chosenCourseId === c.id} onChange={() => setChosenCourseId(c.id)} />
                {c.title}
              </span>
              <span className="font-medium text-gray-700 text-right">
                <LocalFirstPrice amount={c.price} currency={c.currency} country={form.countryOfResidence}>{formatMoney(c.currency, c.price)}</LocalFirstPrice>
              </span>
            </label>
          ))}
        </div>
        <Button className="w-full" size="lg" onClick={handleConfirmCourse} disabled={isSubmitting}>
          {isSubmitting ? step || "Please wait..." : "Continue to payment"}
        </Button>
        <PaymentConsentModal open={showConsent} onAgree={handleAgreeToPay} onOpenChange={setShowConsent} isSubmitting={isPaying} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 md:sticky md:top-6 space-y-4">
      <p className="text-lg font-bold text-gray-900 leading-snug">{cohortName}</p>

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
          <Label>Email *</Label>
          <Input type="email" inputMode="email" autoComplete="email" required value={form.parentEmail} onChange={(e) => handleChange({ parentEmail: e.target.value })} />
        </div>
        <div>
          <Label>Phone number *</Label>
          <Input type="tel" inputMode="tel" autoComplete="tel" required value={form.parentPhone} onChange={(e) => handleChange({ parentPhone: e.target.value })} placeholder="e.g. +234 801 234 5678" />
        </div>
        <div>
          <Label>Choose a password</Label>
          <Input type="password" value={form.password} onChange={(e) => handleChange({ password: e.target.value })} placeholder="8+ characters, with an uppercase letter and a number" />
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
        <p className="text-xs text-gray-500">
          Registering more than one child? <WhatsAppLink pageName={cohortName} label="Message us on WhatsApp" />
        </p>

        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-2 pt-1">
          <div>
            <Label>Coupon code (optional)</Label>
            <Input
              value={form.couponCode}
              onChange={(e) => handleChange({ couponCode: e.target.value })}
              placeholder={page.promoCouponCode || "e.g. SAVE15"}
            />
          </div>
          <div>
            <Label>Referral code (optional)</Label>
            <Input value={form.referralCode} onChange={(e) => handleChange({ referralCode: e.target.value })} placeholder="Who referred you?" />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4">
        {isFlowTree ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {flowTreePath.length > 0 && (
                <span className="block normal-case text-gray-400 mb-1 font-normal">
                  {flowTreePath.map((n) => n.name).join(" > ")}
                </span>
              )}
              {flowTreeLeaf ? "Selected" : "Choose an option"}
            </p>
            {flowTreeLeaf ? (
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-700">{flowTreeLeaf.name}</p>
                {flowTreeQuote ? (
                  <>
                    <p className="text-2xl font-bold text-gray-900"><LocalFirstPrice amount={flowTreeQuote.amount} currency={flowTreeQuote.currency} country={form.countryOfResidence} explain>{formatMoney(flowTreeQuote.currency, flowTreeQuote.amount)}</LocalFirstPrice></p>
                  </>
                ) : priceError ? (
                  <PriceError onRetry={handleRetryPrice} pageName={cohortName} />
                ) : (
                  <PriceSkeleton />
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-700">Pick one below to see its price.</p>
            )}
            <div className="space-y-1.5">
              {canGoBackInTree && (
                <button type="button" onClick={handleBackInTree} className="text-xs text-blue-600 hover:underline">← Back</button>
              )}
              {isLoading || isLoadingFlowTreeStep ? (
                <div className="space-y-1.5" role="status" aria-label="Loading options">
                  <div className="h-10 rounded-md bg-gray-200 animate-pulse" />
                  <div className="h-10 rounded-md bg-gray-200 animate-pulse" />
                </div>
              ) : flowTreeOptions.length === 0 ? (
                <p className="text-sm text-gray-500">Nothing available here yet - please contact us.</p>
              ) : (
                flowTreeOptions.map((n) => (
                  <button key={n.id} type="button" onClick={() => handlePickFlowTreeNode(n)} className={`w-full text-left border rounded-md px-3 py-2.5 text-sm ${flowTreeLeaf?.id === n.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}>{n.name}</button>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Price</p>
            {needsCourseChoice ? (
              <p className="text-sm text-gray-700">Depends on the course you choose - shown before you pay.</p>
            ) : isLoading ? (
              <PriceSkeleton />
            ) : quote ? (
              <>
                <p className="text-2xl font-bold text-gray-900"><LocalFirstPrice amount={quote.amount} currency={quote.currency} country={form.countryOfResidence} explain>{formatMoney(quote.currency, quote.amount)}</LocalFirstPrice></p>
              </>
            ) : priceError ? (
              <PriceError onRetry={handleRetryPrice} pageName={cohortName} />
            ) : (
              <p className="text-2xl font-bold text-gray-900">Contact us</p>
            )}
          </div>
        )}
      </div>

      <Button className="w-full" size="lg" onClick={handleSubmit} disabled={isSubmitting || isLoading}>
        {isSubmitting ? step || "Please wait..." : page.ctaLabel}
      </Button>
      <div className="text-center">
        <WhatsAppLink pageName={cohortName} />
      </div>
      <p className="text-xs text-gray-400 text-center">
        Creates your STC Tutors account{needsCourseChoice ? ", then a quick course pick, " : " and takes you straight "}
        to secure payment. We&apos;ll also email you a link to verify your address - no need to click it before paying.
      </p>
      <PaymentConsentModal open={showConsent} onAgree={handleAgreeToPay} onOpenChange={setShowConsent} isSubmitting={isPaying} />
    </div>
  );
}
