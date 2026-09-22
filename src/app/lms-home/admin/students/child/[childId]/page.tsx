"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { formatDate } from "@/lib/datetime";
import { formatMoney } from "@/lib/money";
import InlineLoader from "@/components/shared/InlineLoader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GetChildAction, GetChildEnrollmentsAction, UpdateChildProfileAction } from "@/server/child";
import { SuspendStudentAction, RemoveStudentAction, ReactivateStudentAction } from "@/server/admin";
import { Child } from "@/types/child";
import { ChildEnrollmentsResponse, EnrollmentPayment, EnrollmentStatus, Student } from "@/types/student";
import { useUser } from "@/contexts/user-context";
import { AdminPermission } from "@/types/admin-permission";

const STATUS_COLORS: Record<string, string> = {
  [EnrollmentStatus.ENROLLED]: "bg-green-100 text-green-700",
  [EnrollmentStatus.PENDING]: "bg-amber-100 text-amber-700",
  [EnrollmentStatus.PENDING_PARENT_CONFIRMATION]: "bg-amber-100 text-amber-700",
  [EnrollmentStatus.COMPLETED]: "bg-blue-100 text-blue-700",
  [EnrollmentStatus.DRAFT]: "bg-gray-100 text-gray-500",
  [EnrollmentStatus.CANCELLED]: "bg-gray-100 text-gray-600",
  [EnrollmentStatus.WAITLISTED]: "bg-purple-100 text-purple-700",
};

export default function AdminChildProfilePage() {
  const { childId } = useParams();
  const router = useRouter();
  const { hasPermission } = useUser();
  const canManageStudents = hasPermission(AdminPermission.MANAGE_STUDENTS);

  const [child, setChild] = useState<Child | null>(null);
  const [enrollmentData, setEnrollmentData] = useState<ChildEnrollmentsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [editSection, setEditSection] = useState<"basic" | "personal" | "identification" | "health" | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const [suspendTarget, setSuspendTarget] = useState<Student | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendDuration, setSuspendDuration] = useState("");
  const [removeTarget, setRemoveTarget] = useState<Student | null>(null);

  const load = async () => {
    const [childRes] = await GetChildAction(childId as string);
    setChild(childRes?.data ?? null);

    const [enrollRes] = await GetChildEnrollmentsAction(childId as string);
    setEnrollmentData(enrollRes?.data ?? null);

    setIsLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId]);

  const openEdit = (section: typeof editSection, initial: Record<string, string | undefined>) => {
    setEditSection(section);
    setForm(Object.fromEntries(Object.entries(initial).map(([k, v]) => [k, v ?? ""])));
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    const [, error] = await UpdateChildProfileAction(childId as string, {
      ...form,
      weightKg: form.weightKg ? Number(form.weightKg) : undefined,
      heightCm: form.heightCm ? Number(form.heightCm) : undefined,
    } as any);
    setIsSaving(false);
    setMessage(error || "Details updated");
    setEditSection(null);
    load();
  };

  const handleSuspend = async () => {
    if (!suspendTarget || !suspendReason.trim()) return;
    setIsSaving(true);
    const [, error] = await SuspendStudentAction(
      suspendTarget.id,
      suspendReason.trim(),
      suspendDuration ? Number(suspendDuration) : undefined
    );
    setIsSaving(false);
    setMessage(error || "Enrollment suspended");
    setSuspendTarget(null);
    setSuspendReason("");
    setSuspendDuration("");
    load();
  };

  const handleReactivate = async (enrollment: Student) => {
    const [, error] = await ReactivateStudentAction(enrollment.id);
    setMessage(error || "Enrollment reactivated");
    load();
  };

  const handleRemove = async () => {
    if (!removeTarget) return;
    setIsSaving(true);
    const [, error] = await RemoveStudentAction(removeTarget.id);
    setIsSaving(false);
    setMessage(error || "Enrollment removed");
    setRemoveTarget(null);
    load();
  };

  if (isLoading) return <InlineLoader />;
  if (!child) return <p className="p-6">Student not found</p>;

  const enrollments = enrollmentData?.enrollments ?? [];
  const payments = enrollmentData?.payments ?? [];

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
          <AvatarImage src={child.photoUrl} alt={child.fullName} />
          <AvatarFallback>{child.fullName?.[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-xl font-bold">{child.fullName}</h1>
          <p className="text-sm text-gray-500">
            Student ID: {child.studentLoginId || child.studentIdCode || "—"} · {enrollments.length} enrollment
            {enrollments.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <InfoCard
          title="Basic Details"
          onEdit={() => openEdit("basic", { fullName: child.fullName })}
          fields={{ "Full Name": child.fullName }}
        />
        <InfoCard
          title="Personal Details"
          onEdit={() =>
            openEdit("personal", {
              gender: child.gender,
              dateOfBirth: child.dateOfBirth ? String(child.dateOfBirth).slice(0, 10) : undefined,
              countryOfResidence: child.countryOfResidence,
              primaryLanguage: child.primaryLanguage,
            })
          }
          fields={{
            Gender: child.gender,
            "Date of Birth": child.dateOfBirth ? formatDate(child.dateOfBirth) : undefined,
            "Country of Residence": child.countryOfResidence,
            "Primary Language": child.primaryLanguage,
          }}
        />
        <InfoCard
          title="Identification Details"
          onEdit={() =>
            openEdit("identification", {
              studentIdCode: child.studentIdCode,
              nationality: child.nationality,
              nin: child.nin,
              grade: child.grade,
              admissionDate: child.admissionDate ? String(child.admissionDate).slice(0, 10) : undefined,
            })
          }
          fields={{
            "Student ID": child.studentLoginId || child.studentIdCode,
            Nationality: child.nationality,
            NIN: child.nin,
            Grade: child.grade,
            "Admission Date": child.admissionDate ? formatDate(child.admissionDate) : undefined,
          }}
        />
        <InfoCard
          title="Health Details"
          onEdit={() =>
            openEdit("health", {
              weightKg: child.weightKg != null ? String(child.weightKg) : undefined,
              heightCm: child.heightCm != null ? String(child.heightCm) : undefined,
              bloodGroup: child.bloodGroup,
            })
          }
          fields={{
            Weight: child.weightKg != null ? `${child.weightKg} kg` : undefined,
            Height: child.heightCm != null ? `${child.heightCm} cm` : undefined,
            "Blood Group": child.bloodGroup,
          }}
        />
      </div>

      <h2 className="text-lg font-semibold mb-3">Enrollments</h2>
      {enrollments.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">No enrollments yet.</p>
      ) : (
        <div className="space-y-3">
          {[...enrollments]
            .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
            .map((enrollment) => (
              <EnrollmentCard
                key={enrollment.id}
                enrollment={enrollment}
                payments={payments.filter((p) => p.student === enrollment.id)}
                canManage={canManageStudents}
                onView={() => router.push(`/lms-home/admin/students/${enrollment.id}`)}
                onSuspend={() => setSuspendTarget(enrollment)}
                onReactivate={() => handleReactivate(enrollment)}
                onRemove={() => setRemoveTarget(enrollment)}
              />
            ))}
        </div>
      )}

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

      {/* Suspend modal */}
      <Dialog open={!!suspendTarget} onOpenChange={(open) => !open && setSuspendTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend Enrollment</DialogTitle>
            <DialogDescription>{suspendTarget?.serviceDetails?.serviceType || suspendTarget?.fullName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Duration (days, optional)</label>
              <Input
                type="number"
                min="1"
                placeholder="Leave blank for indefinite"
                value={suspendDuration}
                onChange={(e) => setSuspendDuration(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Reason for Suspension</label>
              <Textarea value={suspendReason} onChange={(e) => setSuspendReason(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendTarget(null)}>Go Back</Button>
            <Button variant="destructive" onClick={handleSuspend} disabled={isSaving || !suspendReason.trim()}>
              {isSaving ? "Suspending..." : "Suspend enrollment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove confirm modal */}
      <Dialog open={!!removeTarget} onOpenChange={(open) => !open && setRemoveTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove this enrollment?</DialogTitle>
            <DialogDescription>
              This removes access to this specific course/service only - {child.fullName}&apos;s other enrollments and
              login are unaffected. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveTarget(null)}>Go Back</Button>
            <Button variant="destructive" onClick={handleRemove} disabled={isSaving}>
              {isSaving ? "Removing..." : "Remove enrollment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

function scheduleSummary(enrollment: Student): string | undefined {
  if (!enrollment.schedule || enrollment.schedule.length === 0) return undefined;
  return enrollment.schedule.map((s) => `${s.subject}: ${s.days.join("/")} ${s.time} (${s.duration}min)`).join("; ");
}

function paymentSummary(payments: EnrollmentPayment[]): string {
  if (payments.length === 0) return "No payments recorded";
  const completed = payments.filter((p) => p.status === "COMPLETED");
  if (completed.length === 0) {
    const latest = payments[0];
    return `${latest.status} - ${formatMoney(latest.amount, latest.currency)}`;
  }
  const total = completed.reduce((sum, p) => sum + p.amount, 0);
  return `Paid ${formatMoney(total, completed[0].currency)} across ${completed.length} payment${completed.length === 1 ? "" : "s"}`;
}

function EnrollmentCard({
  enrollment,
  payments,
  canManage,
  onView,
  onSuspend,
  onReactivate,
  onRemove,
}: {
  enrollment: Student;
  payments: EnrollmentPayment[];
  canManage: boolean;
  onView: () => void;
  onSuspend: () => void;
  onReactivate: () => void;
  onRemove: () => void;
}) {
  const schedule = scheduleSummary(enrollment);
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-800">
              {enrollment.serviceDetails?.serviceType || "Enrollment"}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[enrollment.enrollmentStatus] ?? "bg-gray-100 text-gray-600"}`}>
              {enrollment.suspensionReason ? "Suspended" : enrollment.enrollmentStatus}
            </span>
          </div>
          <p className="text-xs text-gray-500">Created {enrollment.createdAt ? formatDate(enrollment.createdAt) : "—"}</p>
          {schedule && <p className="text-sm text-gray-600 mt-1">Schedule: {schedule}</p>}
          {enrollment.suspensionReason && (
            <p className="text-sm text-red-600 mt-1">Suspended: {enrollment.suspensionReason}</p>
          )}
          <p className="text-sm text-gray-600 mt-1">{paymentSummary(payments)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onView}>View full details</Button>
          {canManage && (
            enrollment.suspensionReason ? (
              <Button variant="outline" size="sm" onClick={onReactivate}>Reactivate</Button>
            ) : (
              <Button variant="outline" size="sm" onClick={onSuspend}>Suspend</Button>
            )
          )}
          {canManage && (
            <Button variant="destructive" size="sm" onClick={onRemove}>Remove</Button>
          )}
        </div>
      </div>
    </div>
  );
}
