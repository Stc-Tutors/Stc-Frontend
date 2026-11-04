"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Clock, Users, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GetCoursesAction } from "@/server/course";
import { IntakeClosedDialog, useIntakeClosed } from "@/components/intake-closed";
import { EnrollInCourseAction } from "@/server/course-enrollment";
import { InitiatePaymentAction, VerifyPaymentAction } from "@/server/payment";
import { createCheckout } from "@/lib/checkout";
import { PaymentRequest } from "@/types/payment";
import { ROUTES } from "@/config/routes";
import { GetEnrollmentsAction } from "@/server/enrollment";
import { Course } from "@/types/course";
import { LocalFirstPrice } from "@/components/local-price-note";

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [modal, setModal] = useState<{ courseId: string | null }>({ courseId: null });
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const [coursesRes] = await GetCoursesAction({ status: "PUBLISHED" });
      const [enrollmentsRes] = await GetEnrollmentsAction();
      setCourses(coursesRes?.data ?? []);
      setStudentId(enrollmentsRes?.data?.[0]?.id ?? null);
      setIsLoading(false);
    };
    load();
  }, []);

  const enrollClosed = useIntakeClosed(["ENROLLMENT"]);
  const [closedNotice, setClosedNotice] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (enrollClosed) {
      setModal({ courseId: null });
      setClosedNotice(enrollClosed);
      return;
    }
    if (!modal.courseId || !studentId) {
      setMessage("You need an active enrollment before joining a course.");
      setModal({ courseId: null });
      return;
    }
    const course = courses.find((c) => c.id === modal.courseId);
    setEnrolling(modal.courseId);

    // A priced course is paid for first - the verified payment is what adds it (the server refuses a bare enrol).
    if (course && Number(course.price) > 0) {
      const [payRes, payError] = await InitiatePaymentAction({
        student: studentId,
        amount: Number(course.price),
        currency: course.currency,
        description: course.title,
        serviceType: course.serviceType,
        // The server prices this from the course itself - the amount above is never trusted.
        metadata: { courseId: course.id },
      });
      setModal({ courseId: null });
      if (payError || !payRes?.data) {
        setEnrolling(null);
        setMessage(payError || "We couldn't start the payment. Please try again.");
        return;
      }
      const payment = payRes.data as PaymentRequest & { fullyCoveredByWallet?: boolean };
      // The wallet covered everything: already paid and added.
      if (payment.fullyCoveredByWallet) {
        router.push(ROUTES.LMS.STUDENT.PAYMENT_HISTORY);
        return;
      }
      const popup = await createCheckout(payment, { returnTo: ROUTES.LMS.STUDENT.PAYMENT_HISTORY });
      setEnrolling(null);
      popup.resumeTransaction(payment.access_code, {
        onSuccess: async () => {
          await VerifyPaymentAction(payment.reference);
          router.push(ROUTES.LMS.STUDENT.PAYMENT_HISTORY);
        },
        onCancel: () => setMessage("Payment cancelled - you can try again whenever you're ready."),
        onError: (e: { message?: string }) => setMessage(e?.message || "Payment failed - please try again."),
      });
      return;
    }

    const [, error] = await EnrollInCourseAction(modal.courseId, studentId);
    setEnrolling(null);
    setModal({ courseId: null });
    setMessage(error ? error : "Enrolled successfully!");
  };

  return (
    <div className="p-6 relative">
      {closedNotice && <IntakeClosedDialog message={closedNotice} onClose={() => setClosedNotice(null)} />}
      {/* Top Section */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center justify-between flex-wrap gap-2 flex-wrap">
          <button
            onClick={() => router.push("/lms-home/student/courses")}
            className="text-gray-600 hover:text-blue-800 flex items-center gap-1"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">My Courses</span>
          </button>
          <h2 className="text-2xl font-bold">All Courses</h2>
          <span />
        </div>
      </div>

      {message && <p className="text-sm text-blue-600 mb-4">{message}</p>}

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading courses...</p>
      ) : courses.length === 0 ? (
        <p className="text-sm text-gray-500">No published courses available yet.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col md:flex-row"
            >
              <div className="relative w-full md:w-1/3 h-48 md:h-auto">
                <Image
                  src={course.coverImageUrl || "/premium.png"}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-5 flex flex-col flex-1">
                <h2 className="text-lg font-semibold mb-2">{course.title}</h2>

                <div className="flex items-center text-sm text-gray-600 gap-6 mb-3">
                  <div className="flex items-center gap-1 text-blue-600">
                    <BookOpen className="w-4 h-4" />
                    <span>{course.curriculumOutline?.length ?? 0} Lessons</span>
                  </div>
                  <div className="flex items-center gap-1 text-blue-600">
                    <Users className="w-4 h-4" />
                    <span>{course.capacity ? `Max ${course.capacity}` : "Open"}</span>
                  </div>
                  {!!course.schedule?.[0] && (
                    <div className="flex items-center gap-1 text-blue-600">
                      <Clock className="w-4 h-4" />
                      <span>{course.schedule[0].duration} min</span>
                    </div>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-4">{course.description}</p>

                <div className="mt-auto flex items-center justify-between flex-wrap gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    <LocalFirstPrice amount={Number(course.price)} currency={course.currency}>{course.currency} {course.price}</LocalFirstPrice>
                  </span>

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/lms-home/student/courses/${course.id}`)}
                    >
                      View Detail
                    </Button>
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={enrolling === course.id}
                      onClick={() => setModal({ courseId: course.id })}
                    >
                      {enrolling === course.id ? "Enrolling..." : "Enroll"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal.courseId !== null && (
        <div className="fixed inset-0 bg-gray bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw] shadow-lg text-center">
            <div className="mb-4">
              <span className="text-4xl">💡</span>
            </div>
            <h3 className="text-lg font-bold mb-2">Are You Sure You Want to Enroll in This Course?</h3>
            <p className="text-sm text-gray-600 mb-6">
              This will enroll you in the course and give you access to all lessons, resources, and assignments.
            </p>
            <div className="flex justify-between flex-wrap gap-2 flex-wrap">
              <Button variant="outline" className="text-red-500 border-red-300" onClick={() => setModal({ courseId: null })}>
                Go Back
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleConfirm}>
                Enroll
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
