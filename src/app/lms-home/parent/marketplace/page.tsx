"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShoppingBag, UserPlus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChildSwitcherDropdown } from "@/components/child-switcher-dropdown";
import { useSelectedStudent } from "@/contexts/selected-student-context";
import { ToastError, ToastSuccess } from "@/components/ui/custom/toast";
import { ROUTES } from "@/config/routes";

import { GetServicesAction } from "@/server/service-catalog";
import { IService } from "@/types/service-catalog";
import { GetCoursesAction } from "@/server/course";
import { Course } from "@/types/course";
import { QuotePricingAction } from "@/server/pricing";
import { PricingQuote } from "@/types/pricing";
import { EnrollInCourseAction } from "@/server/course-enrollment";
import { InitiatePaymentAction, VerifyPaymentAction } from "@/server/payment";

// Lets a parent add a new course/service to an EXISTING child's enrollments
// (as opposed to /enrollment/new, which registers a brand-new child). Steps:
// pick a child (shared SelectedStudentProvider/ChildSwitcherDropdown), pick a
// published service + course (GetCoursesAction filtered by serviceType,
// mirroring the Path C "Select a Course" cards in
// components/steps/subjects-schedule.tsx), get a live price
// (QuotePricingAction - the same server-authoritative quote the enrollment
// wizard ultimately trusts over any client-side estimate), then
// EnrollInCourseAction + InitiatePaymentAction.
export default function ParentMarketplacePage() {
  const router = useRouter();
  const { students, selectedStudent, isLoading: studentsLoading } = useSelectedStudent();

  const [services, setServices] = useState<IService[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [selectedSlug, setSelectedSlug] = useState("");

  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("");

  const [quote, setQuote] = useState<PricingQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedService = services.find((s) => s.slug === selectedSlug) ?? null;
  const selectedCourse = courses.find((c) => c.id === selectedCourseId) ?? null;

  useEffect(() => {
    GetServicesAction().then(([res]) => {
      setServices(res?.data ?? []);
      setServicesLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedSlug) {
      setCourses([]);
      return;
    }
    setCoursesLoading(true);
    setSelectedCourseId("");
    setQuote(null);
    GetCoursesAction({ serviceType: selectedSlug }).then(([res]) => {
      setCourses(res?.data ?? []);
      setCoursesLoading(false);
    });
  }, [selectedSlug]);

  // Live quote, re-fetched every time the course selection narrows -
  // PricingService.getQuote is the backend's authoritative price, only used
  // here for display/what-we're-about-to-charge; the course's own
  // price/currency is the fallback if a quote can't be resolved (e.g. no
  // pricing row configured yet for this course).
  useEffect(() => {
    if (!selectedCourse || !selectedService) {
      setQuote(null);
      setQuoteError(null);
      return;
    }
    setQuoteLoading(true);
    setQuoteError(null);
    QuotePricingAction({ serviceType: selectedService.slug, courseId: selectedCourse.id }).then(([res, error]) => {
      if (error || !res?.data) {
        setQuoteError(error || "Couldn't fetch a live quote - showing the course's listed price instead.");
        setQuote(null);
      } else {
        setQuote(res.data);
      }
      setQuoteLoading(false);
    });
  }, [selectedCourse, selectedService]);

  const displayAmount = quote?.amount ?? selectedCourse?.price ?? 0;
  const displayCurrency = quote?.currency ?? selectedCourse?.currency ?? "NGN";

  const handleConfirm = async () => {
    if (!selectedStudent || !selectedCourse || !selectedService) return;

    setIsSubmitting(true);
    try {
      const [enrollRes, enrollError] = await EnrollInCourseAction(selectedCourse.id, selectedStudent.id);
      if (enrollError || !enrollRes?.data) {
        ToastError(enrollError || "Failed to add this course");
        return;
      }

      if (displayAmount > 0) {
        const [payRes, payError] = await InitiatePaymentAction({
          student: selectedStudent.id,
          amount: displayAmount,
          currency: displayCurrency,
          description: `${selectedService.serviceName}: ${selectedCourse.title}`,
          serviceType: selectedService.slug,
          metadata: { courseId: selectedCourse.id },
        });

        if (payError || !payRes?.data) {
          ToastError(payError || "Course added, but payment couldn't be started. Complete it from Payments.");
          router.push("/lms-home/parent/payments");
          return;
        }

        // Mirrors the resume-transaction pattern already used to complete
        // checkout after enrollment-flow.tsx's saveEnrollment (see
        // handleNext there) rather than a raw redirect, so the parent gets
        // the same in-app Paystack popup everywhere in this app.
        const { default: PaystackPop } = await import("@paystack/inline-js");
        const popup = new PaystackPop();
        popup.resumeTransaction(payRes.data.access_code, {
          onSuccess: async () => {
            // Don't rely solely on Paystack's webhook reaching the backend -
            // see enrollment-flow.tsx's onSuccess for the same reasoning.
            await VerifyPaymentAction(payRes.data!.reference);
            ToastSuccess("Payment successful - course added");
            router.push("/lms-home/parent/payments");
          },
          onCancel: () => {
            ToastError("Payment was not completed. You can finish it anytime from Payments.");
            router.push("/lms-home/parent/payments");
          },
          onError: (error) => {
            ToastError(error?.message || "Payment failed. Please try again.");
          },
        });
      } else {
        ToastSuccess(`${selectedCourse.title} added to ${selectedStudent.fullName}'s enrollments`);
        setSelectedCourseId("");
        setQuote(null);
      }
    } catch (error) {
      ToastError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!studentsLoading && students.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center space-y-3">
          <ShoppingBag className="w-10 h-10 mx-auto text-gray-400" />
          <p className="text-gray-600">Add a child before browsing services to enroll them in.</p>
          <Button onClick={() => router.push(ROUTES.LMS.PARENT.ADD_CHILD)}>
            <UserPlus className="w-4 h-4 mr-2" /> Add Child
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Marketplace</h1>
          <p className="text-gray-500 text-sm">Browse services and add courses to your child&apos;s enrollments.</p>
        </div>
        <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2">
          <span className="text-sm text-gray-500">Shopping for</span>
          <ChildSwitcherDropdown />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Choose a service</CardTitle>
        </CardHeader>
        <CardContent>
          {servicesLoading && <p className="text-sm text-gray-500">Loading services...</p>}
          {!servicesLoading && services.length === 0 && (
            <p className="text-sm text-gray-500">No services available right now.</p>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {services.map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() => setSelectedSlug(service.slug)}
                className={`text-left border-2 rounded-lg p-4 transition-colors ${
                  selectedSlug === service.slug ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <p className="font-medium text-gray-900">{service.serviceName}</p>
                {service.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{service.description}</p>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedSlug && (
        <Card>
          <CardHeader>
            <CardTitle>2. Choose a course</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {coursesLoading && <p className="text-sm text-gray-500">Loading courses...</p>}
            {!coursesLoading && courses.length === 0 && (
              <p className="text-sm text-gray-500">No published courses for this service yet.</p>
            )}
            <div className="grid gap-3">
              {courses.map((course) => (
                <label
                  key={course.id}
                  className={`flex items-start justify-between border rounded-lg p-3 cursor-pointer ${
                    selectedCourseId === course.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="course"
                      className="mt-1"
                      checked={selectedCourseId === course.id}
                      onChange={() => setSelectedCourseId(course.id)}
                    />
                    <div>
                      <p className="font-medium text-gray-900">{course.title}</p>
                      {course.subtitle && <p className="text-sm text-gray-600">{course.subtitle}</p>}
                    </div>
                  </div>
                  <p className="font-semibold text-green-700 whitespace-nowrap">
                    {course.currency ?? "NGN"} {course.price?.toLocaleString()}
                  </p>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedCourse && (
        <Card>
          <CardHeader>
            <CardTitle>3. Confirm &amp; pay</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between border rounded-lg p-4 bg-gray-50">
              <div>
                <p className="text-sm text-gray-500">Enrolling</p>
                <p className="font-medium text-gray-900">{selectedStudent?.fullName}</p>
                <p className="text-sm text-gray-500 mt-2">{selectedCourse.title}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Price</p>
                {quoteLoading ? (
                  <p className="text-sm text-gray-500 flex items-center gap-1 justify-end">
                    <Loader2 className="w-4 h-4 animate-spin" /> Fetching live quote...
                  </p>
                ) : (
                  <p className="text-xl font-bold text-gray-900">
                    {displayCurrency} {displayAmount.toLocaleString()}
                  </p>
                )}
                {quoteError && <p className="text-xs text-amber-600 mt-1 max-w-xs">{quoteError}</p>}
              </div>
            </div>

            <Button
              onClick={handleConfirm}
              disabled={isSubmitting || quoteLoading || !selectedStudent}
              className="w-full md:w-auto"
            >
              {isSubmitting ? "Processing..." : displayAmount > 0 ? "Confirm & Pay" : "Confirm & Add Course"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
