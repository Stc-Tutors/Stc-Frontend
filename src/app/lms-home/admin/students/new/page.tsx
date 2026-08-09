"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserSearchSelect } from "@/components/user-search-select";
import { CreateEnrollmentByAdminAction } from "@/server/admin";
import { UserRole } from "@/types/user";

export default function AddNewStudentPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [parentUserId, setParentUserId] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [grade, setGrade] = useState("");
  const [admissionDate, setAdmissionDate] = useState("");
  const [countryOfResidence, setCountryOfResidence] = useState("");
  const [primaryLanguage, setPrimaryLanguage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!fullName.trim() || !parentUserId) {
      setError("Student name and a linked parent account are required");
      return;
    }
    setIsSaving(true);
    const [res, err] = await CreateEnrollmentByAdminAction({
      fullName: fullName.trim(),
      parentUserId,
      parentPhone: parentPhone || undefined,
      gender: gender || undefined,
      dateOfBirth: dateOfBirth || undefined,
      grade: grade || undefined,
      admissionDate: admissionDate || undefined,
      photoUrl: photoUrl || undefined,
      countryOfResidence: countryOfResidence || undefined,
      primaryLanguage: primaryLanguage || undefined,
    });
    setIsSaving(false);
    if (err || !res?.data) {
      setError(err || "Failed to add student");
      return;
    }
    router.push(`/lms-home/admin/students/${res.data.id}`);
  };

  return (
    <div className="bg-white shadow rounded-2xl p-6 max-w-2xl">
      <button
        onClick={() => router.push("/lms-home/admin/students")}
        className="flex items-center text-gray-700 mb-4 hover:text-blue-500"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        <span className="text-sm font-bold">BACK</span>
      </button>

      <h1 className="text-2xl font-bold mb-6">Add New Student</h1>
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <div className="space-y-4">
        <div>
          <Label className="mb-1 block">Student Name</Label>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Student's full name" />
        </div>

        <div>
          <Label className="mb-1 block">Parent account</Label>
          <UserSearchSelect role={UserRole.PARENT} value={parentUserId} onChange={setParentUserId} placeholder="Search parent by name or email" />
        </div>

        <div>
          <Label className="mb-1 block">Parent phone number</Label>
          <Input value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} placeholder="+234..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="mb-1 block">Gender</Label>
            <div className="flex gap-4 pt-2">
              {["Male", "Female", "Other"].map((g) => (
                <label key={g} className="flex items-center gap-1 text-sm">
                  <input type="radio" name="gender" checked={gender === g} onChange={() => setGender(g)} />
                  {g}
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label className="mb-1 block">Date of Birth</Label>
            <Input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="mb-1 block">Grade/Class</Label>
            <Input value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="e.g. SS3" />
          </div>
          <div>
            <Label className="mb-1 block">Admission Date</Label>
            <Input type="date" value={admissionDate} onChange={(e) => setAdmissionDate(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="mb-1 block">Country of Residence</Label>
            <Input value={countryOfResidence} onChange={(e) => setCountryOfResidence(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1 block">Primary Language</Label>
            <Input value={primaryLanguage} onChange={(e) => setPrimaryLanguage(e.target.value)} />
          </div>
        </div>

        <div>
          <Label className="mb-1 block">Profile picture URL</Label>
          <Input value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://..." />
        </div>

        <Button className="w-full" onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? "Saving..." : "Continue"}
        </Button>
      </div>
    </div>
  );
}
