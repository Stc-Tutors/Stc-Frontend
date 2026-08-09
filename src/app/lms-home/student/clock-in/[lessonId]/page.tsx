"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GetLessonAction } from "@/server/lesson";
import { GetEnrollmentsAction, GetLinkedStudentsAction } from "@/server/enrollment";
import { ConfirmPresenceAction } from "@/server/attendance";
import { Lesson } from "@/types/lesson";
import { Course } from "@/types/course";
import { Student } from "@/types/student";

export default function ClockInPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-gray-500">Loading...</p>}>
      <ClockInPageInner />
    </Suspense>
  );
}

function ClockInPageInner() {
  const { lessonId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentId, setStudentId] = useState(searchParams.get("studentId") || "");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [lessonRes] = await GetLessonAction(lessonId as string);
      setLesson(lessonRes?.data ?? null);

      const [linkedRes] = await GetLinkedStudentsAction();
      const [ownRes] = await GetEnrollmentsAction();
      const byId = new Map<string, Student>();
      [...(linkedRes?.data ?? []), ...(ownRes?.data ?? [])].forEach((s) => byId.set(s.id, s));
      const list = Array.from(byId.values());
      setStudents(list);
      if (!studentId && list.length > 0) setStudentId(list[0].id);

      setIsLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  const handleConfirm = async () => {
    if (!studentId) {
      setError("Select which student this is for");
      return;
    }
    if (!password) {
      setError("Enter your password to confirm presence");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    const [, err] = await ConfirmPresenceAction({ lessonId: lessonId as string, studentId, password });
    setIsSubmitting(false);
    if (err) {
      setError(err);
      return;
    }
    setSuccess(true);
  };

  const courseTitle = lesson && typeof lesson.course !== "string" ? (lesson.course as Course).title : undefined;

  if (isLoading) return <p className="p-6 text-sm text-gray-500">Loading...</p>;

  return (
    <div className="max-w-md mx-auto space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center text-gray-700 hover:text-blue-500"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        <span className="text-sm font-bold">BACK</span>
      </button>

      <div className="bg-white rounded-2xl shadow p-6 space-y-4">
        <div>
          <h1 className="text-xl font-bold">Clock In</h1>
          <p className="text-sm text-gray-500 mt-1">
            {lesson ? `${lesson.title}${courseTitle ? ` — ${courseTitle}` : ""}` : "Confirm your presence for this lesson"}
          </p>
          {lesson && (
            <p className="text-xs text-gray-400 mt-1">{new Date(lesson.scheduledDate).toLocaleString()}</p>
          )}
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-2 py-6 text-green-600">
            <CheckCircle2 className="w-10 h-10" />
            <p className="font-medium">Presence confirmed</p>
            <Button variant="outline" onClick={() => router.push("/lms-home/student/dashboard")}>
              Back to dashboard
            </Button>
          </div>
        ) : (
          <>
            {error && <p className="text-sm text-red-600">{error}</p>}

            {students.length > 1 && (
              <div className="space-y-2">
                <Label>Which student is this for?</Label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full border rounded-md p-2 text-sm"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.fullName}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password to confirm presence"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button className="w-full" onClick={handleConfirm} disabled={isSubmitting}>
              {isSubmitting ? "Confirming..." : "Confirm Presence"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
