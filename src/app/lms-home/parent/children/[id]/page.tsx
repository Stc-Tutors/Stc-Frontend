"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GetChildAction, UpdateChildProfileAction } from "@/server/child";
import { Child } from "@/types/child";
import { ToastError, ToastSuccess } from "@/components/ui/custom/toast";

// A family's own view/edit of their child's identity profile - previously
// only reachable via an admin-only dialog (see Stc-SuperAdmin's Edit
// Details). Backed by stcbe's Child entity (GET/PATCH /children/:id), which
// every one of the child's service enrollments denormalizes a copy of, kept
// in sync by ChildService.updateProfile whenever this form saves.
export default function ChildProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [child, setChild] = useState<Child | null>(null);
  const [form, setForm] = useState<Partial<Child>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    GetChildAction(id as string).then(([res, error]) => {
      if (error || !res?.data) {
        setLoadError(error || "Could not load this child's profile");
        setIsLoading(false);
        return;
      }
      setChild(res.data);
      setForm(res.data);
      setIsLoading(false);
    });
  }, [id]);

  const set = <K extends keyof Child>(key: K, value: Child[K]) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setIsSaving(true);
    const [res, error] = await UpdateChildProfileAction(id as string, {
      fullName: form.fullName,
      dateOfBirth: form.dateOfBirth,
      gender: form.gender,
      countryOfResidence: form.countryOfResidence,
      phone: form.phone,
      primaryLanguage: form.primaryLanguage,
      parentName: form.parentName,
      parentEmail: form.parentEmail,
      parentPhone: form.parentPhone,
      parentOccupation: form.parentOccupation,
      photoUrl: form.photoUrl,
      nationality: form.nationality,
      nin: form.nin,
      weightKg: form.weightKg,
      heightCm: form.heightCm,
      bloodGroup: form.bloodGroup,
    });
    setIsSaving(false);
    if (error || !res?.data) {
      ToastError(error || "Failed to save changes");
      return;
    }
    setChild(res.data);
    setForm(res.data);
    ToastSuccess("Profile updated");
  };

  if (isLoading) return <p className="text-sm text-gray-500 p-6">Loading...</p>;

  if (loadError || !child) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-4">
        <button onClick={() => router.back()} className="flex items-center text-gray-600 text-sm hover:text-gray-900">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        <p className="text-sm text-red-600">{loadError || "Child not found"}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <button onClick={() => router.back()} className="flex items-center text-gray-600 text-sm hover:text-gray-900">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </button>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">{child.fullName}&apos;s Profile</h1>
        <p className="text-gray-500 text-sm">Shared across every one of their enrollments.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Full Name</Label>
            <Input value={form.fullName ?? ""} onChange={(e) => set("fullName", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Gender</Label>
            <Select value={form.gender ?? ""} onValueChange={(v) => set("gender", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Date of Birth</Label>
            <Input
              type="date"
              value={form.dateOfBirth ? String(form.dateOfBirth).slice(0, 10) : ""}
              onChange={(e) => set("dateOfBirth", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Country of Residence</Label>
            <Input value={form.countryOfResidence ?? ""} onChange={(e) => set("countryOfResidence", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Primary Language</Label>
            <Input value={form.primaryLanguage ?? ""} onChange={(e) => set("primaryLanguage", e.target.value)} />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Photo URL</Label>
            <Input
              placeholder="https://..."
              value={form.photoUrl ?? ""}
              onChange={(e) => set("photoUrl", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Parent/Guardian</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={form.parentName ?? ""} onChange={(e) => set("parentName", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Occupation</Label>
            <Input value={form.parentOccupation ?? ""} onChange={(e) => set("parentOccupation", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={form.parentEmail ?? ""} onChange={(e) => set("parentEmail", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input value={form.parentPhone ?? ""} onChange={(e) => set("parentPhone", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Identification &amp; Health</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Nationality</Label>
            <Input value={form.nationality ?? ""} onChange={(e) => set("nationality", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>NIN</Label>
            <Input value={form.nin ?? ""} onChange={(e) => set("nin", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Weight (kg)</Label>
            <Input
              type="number"
              value={form.weightKg ?? ""}
              onChange={(e) => set("weightKg", e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Height (cm)</Label>
            <Input
              type="number"
              value={form.heightCm ?? ""}
              onChange={(e) => set("heightCm", e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Blood Group</Label>
            <Input value={form.bloodGroup ?? ""} onChange={(e) => set("bloodGroup", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {(child.grade || child.admissionDate || child.studentIdCode) && (
        <Card>
          <CardHeader>
            <CardTitle>School Record</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            {child.studentIdCode && (
              <div>
                <p className="text-gray-500">Student ID</p>
                <p className="font-medium">{child.studentIdCode}</p>
              </div>
            )}
            {child.grade && (
              <div>
                <p className="text-gray-500">Grade</p>
                <p className="font-medium">{child.grade}</p>
              </div>
            )}
            {child.admissionDate && (
              <div>
                <p className="text-gray-500">Admission Date</p>
                <p className="font-medium">{new Date(child.admissionDate).toLocaleDateString()}</p>
              </div>
            )}
            <p className="text-xs text-gray-400 md:col-span-2">Set by an administrator - contact support to change these.</p>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
