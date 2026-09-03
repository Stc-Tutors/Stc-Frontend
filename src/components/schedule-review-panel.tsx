"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApproveScheduleAction } from "@/server/enrollment";
import { CreateScheduleProposalAction } from "@/server/schedule-proposal";
import { AllocateTutorAction } from "@/server/course-enrollment";
import { GetUsersAction } from "@/server/admin";
import { GetCoursesAction } from "@/server/course";
import { ISchedule, ScheduleReviewStatus, Student } from "@/types/student";
import { User, UserRole } from "@/types/user";
import { Course } from "@/types/course";
import { scheduleTimeFrom24Hour, scheduleTimeTo24Hour } from "@/lib/datetime";

import { WEEKDAYS_ABBREVIATED } from "@/constants/weekdays";
const DAYS = WEEKDAYS_ABBREVIATED;

function ScheduleList({ schedule }: { schedule: ISchedule[] }) {
  return (
    <div className="space-y-1">
      {schedule.map((slot, i) => (
        <p key={i} className="text-sm text-gray-700">
          <span className="font-medium">{slot.subject}</span> — {slot.days.join(", ")} at {slot.time} ({slot.duration} min)
        </p>
      ))}
    </div>
  );
}

// Once a schedule is APPROVED, an admin enrolls the student into one of that
// tutor's existing Courses - the recurring Lesson batch is generated
// server-side (CourseEnrollmentService.allocateWithSchedule).
function TutorAllocationForm({ student, onDone }: { student: Student; onDone: () => void }) {
  const subjects = Array.from(new Set((student.schedule ?? []).map((s) => s.subject)));
  const [subject, setSubject] = useState(subjects[0] ?? "");
  const [tutors, setTutors] = useState<User[]>([]);
  const [tutorId, setTutorId] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    GetUsersAction({ role: UserRole.TUTOR }).then(([res]) => setTutors(res?.data ?? []));
  }, []);

  useEffect(() => {
    setCourseId("");
    if (!tutorId) {
      setCourses([]);
      return;
    }
    GetCoursesAction({ tutor: tutorId }).then(([res]) => setCourses(res?.data ?? []));
  }, [tutorId]);

  const handleAllocate = async () => {
    if (!subject || !courseId) {
      setMessage("Pick a subject and one of the tutor's courses");
      return;
    }
    setIsSubmitting(true);
    const [res, error] = await AllocateTutorAction(student.id, courseId, subject);
    setIsSubmitting(false);
    if (error || !res?.data) {
      setMessage(error || "Failed to allocate tutor");
      return;
    }
    const { created, skipped } = res.data;
    setMessage(`Tutor allocated — ${created.length} lesson(s) scheduled${skipped.length ? `, ${skipped.length} skipped (conflicts)` : ""}`);
    onDone();
  };

  return (
    <div className="border-t border-gray-100 pt-3 space-y-2">
      <p className="text-xs font-medium text-gray-600">Find a tutor</p>
      {message && <p className="text-xs text-blue-600">{message}</p>}
      <div className="grid grid-cols-2 gap-2">
        <select value={subject} onChange={(e) => setSubject(e.target.value)} className="border border-gray-300 rounded-md px-2 py-1.5 text-sm">
          {subjects.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select value={tutorId} onChange={(e) => setTutorId(e.target.value)} className="border border-gray-300 rounded-md px-2 py-1.5 text-sm">
          <option value="">Select a tutor...</option>
          {tutors.map((t) => (
            <option key={t.id} value={t.id}>
              {t.firstName} {t.lastName}
            </option>
          ))}
        </select>
      </div>
      {tutorId && (
        <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm">
          <option value="">
            {courses.length === 0 ? "This tutor has no courses yet - create one first" : "Select one of their courses..."}
          </option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title} {c.schedule?.[0] ? `(${c.schedule[0].days.join(", ")} ${c.schedule[0].time})` : ""}
            </option>
          ))}
        </select>
      )}
      <Button size="sm" onClick={handleAllocate} disabled={isSubmitting || !courseId}>
        {isSubmitting ? "Allocating..." : "Allocate tutor & generate lessons"}
      </Button>
    </div>
  );
}

export default function ScheduleReviewPanel({ student, onChanged }: { student: Student; onChanged: () => void }) {
  const [isProposing, setIsProposing] = useState(false);
  const [subject, setSubject] = useState("");
  const [days, setDays] = useState<string[]>([]);
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("60");
  const [isApproving, setIsApproving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!student.scheduleReviewStatus || !student.schedule?.length) return null;

  // The family already picked these at registration - no reason to make an
  // admin retype a subject name that's sitting right here on the record.
  const availableSubjects = student.serviceDetails?.selectedSubjects ?? [];

  const toggleDay = (day: string) => {
    setDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const handleApprove = async () => {
    setIsApproving(true);
    const [, error] = await ApproveScheduleAction(student.id);
    setIsApproving(false);
    setMessage(error || "Schedule approved as submitted");
    if (!error) onChanged();
  };

  const handlePropose = async () => {
    if (!subject || days.length === 0 || !time) {
      setMessage("Fill in subject, at least one day, and a time");
      return;
    }
    const [, error] = await CreateScheduleProposalAction(student.id, [
      { subject, days, time, duration: Number(duration) || 60 },
    ]);
    if (error) {
      setMessage(error);
      return;
    }
    setMessage("Schedule proposed — pending the family's confirmation");
    setSubject("");
    setDays([]);
    setTime("");
    setIsProposing(false);
    onChanged();
  };

  const isApproved = student.scheduleReviewStatus === ScheduleReviewStatus.APPROVED;

  return (
    <Card>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Requested schedule</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isApproved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>
            {isApproved ? "Approved" : "Pending review"}
          </span>
        </div>

        <ScheduleList schedule={student.schedule} />
        {message && <p className="text-xs text-blue-600">{message}</p>}

        {!isApproved && (
          <div className="flex items-center gap-2 pt-1">
            <Button size="sm" onClick={handleApprove} disabled={isApproving}>
              {isApproving ? "Approving..." : "Approve as submitted"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsProposing((s) => !s);
                if (!isProposing && !subject) setSubject(availableSubjects[0] ?? "");
              }}
            >
              {isProposing ? "Cancel" : "Propose a different schedule"}
            </Button>
          </div>
        )}

        {isProposing && (
          <div className="border-t border-gray-100 pt-3 space-y-2">
            {availableSubjects.length > 0 ? (
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm"
              >
                {availableSubjects.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            ) : (
              <Input placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
            )}
            <div className="flex flex-wrap gap-2">
              {DAYS.map((d) => (
                <button
                  key={d}
                  onClick={() => toggleDay(d)}
                  className={`px-2 py-1 rounded-md text-xs border ${
                    days.includes(d) ? "bg-gray-900 text-white border-gray-900" : "border-gray-300 text-gray-600"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {/* Native picker, not a typed string - see scheduleTimeTo24Hour/
                  From24Hour, which convert to/from the "8:00am"-style string
                  this actually saves as (what parseTimeToMinutes requires
                  for conflict detection and Lesson generation - typing a
                  24-hour "16:00" string here before, per the old placeholder
                  text, silently failed to ever produce lessons once a tutor
                  was allocated). */}
              <Input
                type="time"
                value={scheduleTimeTo24Hour(time)}
                onChange={(e) => setTime(scheduleTimeFrom24Hour(e.target.value))}
              />
              <Input type="number" min="1" placeholder="Duration (minutes)" value={duration} onChange={(e) => setDuration(e.target.value)} />
            </div>
            <Button size="sm" onClick={handlePropose}>
              Send proposal
            </Button>
          </div>
        )}

        {isApproved && <TutorAllocationForm student={student} onDone={onChanged} />}
      </CardContent>
    </Card>
  );
}
