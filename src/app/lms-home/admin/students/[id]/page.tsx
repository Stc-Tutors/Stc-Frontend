"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Circle as CircleIcon } from "lucide-react";
import { Circle } from "rc-progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GetEnrollmentAction } from "@/server/enrollment";
import { GetAcademicSummaryAction, ReactivateStudentAction, UpdateStudentAdminProfileAction } from "@/server/admin";
import { GetNotificationsAction } from "@/server/notification";
import { AcademicSummary, Student, studentAvatarUrl } from "@/types/student";
import ScheduleReviewPanel from "@/components/schedule-review-panel";

export default function AdminStudentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [summary, setSummary] = useState<AcademicSummary | null>(null);
  const [announcements, setAnnouncements] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [editSection, setEditSection] = useState<"basic" | "personal" | "identification" | "health" | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const load = async () => {
    const [res] = await GetEnrollmentAction(id as string);
    setStudent(res?.data ?? null);

    const [summaryRes] = await GetAcademicSummaryAction(id as string);
    setSummary(summaryRes?.data ?? null);

    const [notifRes] = await GetNotificationsAction();
    setAnnouncements((notifRes?.data ?? []).slice(0, 5).map((n) => n.body));

    setIsLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const openEdit = (section: typeof editSection, initial: Record<string, string | undefined>) => {
    setEditSection(section);
    setForm(Object.fromEntries(Object.entries(initial).map(([k, v]) => [k, v ?? ""])));
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    const [, error] = await UpdateStudentAdminProfileAction(id as string, {
      ...form,
      weightKg: form.weightKg ? Number(form.weightKg) : undefined,
      heightCm: form.heightCm ? Number(form.heightCm) : undefined,
    } as any);
    setIsSaving(false);
    setMessage(error || "Details updated");
    setEditSection(null);
    load();
  };

  const handleReactivate = async () => {
    const [, error] = await ReactivateStudentAction(id as string);
    setMessage(error || "Student reactivated");
    load();
  };

  if (isLoading) return <p className="p-6">Loading...</p>;
  if (!student) return <p className="p-6">Student not found</p>;

  return (
    <div className="bg-white shadow rounded-2xl p-6">
      <button
        onClick={() => router.push("/lms-home/admin/students")}
        className="flex items-center text-gray-700 mb-4 hover:text-blue-500"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        <span className="text-sm font-bold">BACK</span>
      </button>

      {message && <p className="text-sm text-blue-600 mb-4">{message}</p>}

      <div className="flex items-center gap-4 mb-6">
        <Avatar className="h-16 w-16">
          <AvatarImage src={student.photoUrl || studentAvatarUrl(student.user)} alt={student.fullName} />
          <AvatarFallback>{student.fullName?.[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-xl font-bold">{student.fullName}</h1>
          <p className="text-sm text-gray-500">Student ID: {student.studentIdCode || "—"}</p>
        </div>
        {student.suspensionReason && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-700">
              Suspended: {student.suspensionReason}
            </span>
            <Button size="sm" variant="outline" onClick={handleReactivate}>Reactivate</Button>
          </div>
        )}
      </div>

      <div className="mb-6">
        <ScheduleReviewPanel student={student} onChanged={load} />
      </div>

      <Tabs defaultValue="personal">
        <TabsList>
          <TabsTrigger value="personal">Personal Information</TabsTrigger>
          <TabsTrigger value="academic">Academic Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4 pt-4">
          <InfoCard
            title="Basic Details"
            onEdit={() => openEdit("basic", { fullName: student.fullName })}
            fields={{ "Full Name": student.fullName }}
          />
          <InfoCard
            title="Personal Details"
            onEdit={() =>
              openEdit("personal", {
                gender: student.gender,
                dateOfBirth: student.dateOfBirth ? String(student.dateOfBirth).slice(0, 10) : undefined,
                countryOfResidence: student.countryOfResidence,
                primaryLanguage: student.primaryLanguage,
              })
            }
            fields={{
              Gender: student.gender,
              "Date of Birth": student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : undefined,
              "Country of Residence": student.countryOfResidence,
              "Primary Language": student.primaryLanguage,
            }}
          />
          <InfoCard
            title="Identification Details"
            onEdit={() =>
              openEdit("identification", {
                studentIdCode: student.studentIdCode,
                nationality: student.nationality,
                nin: student.nin,
                grade: student.grade,
                admissionDate: student.admissionDate ? String(student.admissionDate).slice(0, 10) : undefined,
              })
            }
            fields={{
              "Student ID": student.studentIdCode,
              Nationality: student.nationality,
              NIN: student.nin,
              Grade: student.grade,
              "Admission Date": student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : undefined,
            }}
          />
          <InfoCard
            title="Health Details"
            onEdit={() =>
              openEdit("health", {
                weightKg: student.weightKg != null ? String(student.weightKg) : undefined,
                heightCm: student.heightCm != null ? String(student.heightCm) : undefined,
                bloodGroup: student.bloodGroup,
              })
            }
            fields={{
              Weight: student.weightKg != null ? `${student.weightKg} kg` : undefined,
              Height: student.heightCm != null ? `${student.heightCm} cm` : undefined,
              "Blood Group": student.bloodGroup,
            }}
          />
        </TabsContent>

        <TabsContent value="academic" className="pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="grid grid-cols-2 gap-4">
              <RingStat label="Attendance Record" percent={summary?.attendanceRate ?? 0} />
              <RingStat label="Assignment Completion" percent={summary?.assignmentCompletionRate ?? 0} />
              <RingStat label="Average Grade" percent={summary?.averageGrade ?? 0} />
              <RingStat label="Course Progress" percent={summary?.courseProgressRate ?? 0} />
            </div>
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Announcements</h3>
              {announcements.length === 0 ? (
                <p className="text-sm text-gray-400">No announcements yet.</p>
              ) : (
                <ul className="space-y-1 text-sm text-gray-600">
                  {announcements.map((a, i) => (
                    <li key={i} className="border-b pb-1 last:border-none">{a}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit dialog (simple inline panel rather than modal, per-section) */}
      {editSection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setEditSection(null)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-3" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold capitalize">{editSection} details</h3>
            {Object.keys(form).map((key) => (
              <div key={key}>
                <Label className="mb-1 block text-xs capitalize">{key.replace(/([A-Z])/g, " $1")}</Label>
                <Input value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditSection(null)}>Cancel</Button>
              <Button onClick={handleSaveEdit} disabled={isSaving}>{isSaving ? "Saving..." : "Save"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({
  title,
  fields,
  onEdit,
}: {
  title: string;
  fields: Record<string, string | undefined>;
  onEdit: () => void;
}) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <button onClick={onEdit} className="text-xs text-blue-600 hover:underline">Edit details</button>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        {Object.entries(fields).map(([label, value]) => (
          <div key={label}>
            <p className="text-gray-500 text-xs">{label}</p>
            <p className="text-gray-800">{value || "—"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RingStat({ label, percent }: { label: string; percent: number }) {
  return (
    <div className="border rounded-lg p-4 flex flex-col items-center gap-2">
      <div className="relative w-20 h-20">
        <Circle percent={percent} strokeWidth={8} trailWidth={8} strokeColor="#3b82f6" trailColor="#e5e7eb" />
        <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-800">
          {Math.round(percent)}%
        </div>
      </div>
      <p className="text-xs text-gray-500 text-center">{label}</p>
    </div>
  );
}
