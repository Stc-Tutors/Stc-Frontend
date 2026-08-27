"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchableCombobox } from "@/components/ui/searchable-combobox";
import { useUser } from "@/contexts/user-context";
import { GetEnrollmentAction, UpdateEnrollmentAction } from "@/server/enrollment";
import { GetTaxonomyOptionsAction } from "@/server/taxonomy-option";
import { ITaxonomyOption, TaxonomyOptionKind } from "@/types/service-catalog";
import { UserRole } from "@/types/user";

// Edits the personal/contact details a student or parent already supplied
// during enrollment (fullName/gender/dateOfBirth/countryOfResidence/phone/
// primaryLanguage/parent contact) via PUT /enrollments/:id. Deliberately
// excludes schedule/serviceDetails - those go through the dedicated
// reschedule and admin-review pipelines instead of a direct self-edit.
export default function EditEnrollmentForm({
  enrollmentId,
  basePath,
}: {
  enrollmentId: string;
  basePath: string;
}) {
  const router = useRouter();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phone, setPhone] = useState("");
  const [countryOfResidence, setCountryOfResidence] = useState("");
  const [primaryLanguage, setPrimaryLanguage] = useState("English");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentOccupation, setParentOccupation] = useState("");
  const [countries, setCountries] = useState<ITaxonomyOption[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);

  const isStudentOwner = user?.role === UserRole.STUDENT;

  useEffect(() => {
    GetTaxonomyOptionsAction(TaxonomyOptionKind.COUNTRY).then(([res]) => {
      setCountries(res?.data ?? []);
      setIsLoadingCountries(false);
    });
  }, []);

  useEffect(() => {
    (async () => {
      const [res, err] = await GetEnrollmentAction(enrollmentId);
      if (err || !res?.data) {
        setError(err || "Could not load this record");
        setIsLoading(false);
        return;
      }
      const s = res.data;
      setFullName(s.fullName || "");
      setGender(s.gender || "");
      setDateOfBirth(s.dateOfBirth ? new Date(s.dateOfBirth).toISOString().slice(0, 10) : "");
      setPhone(s.phone || "");
      setCountryOfResidence(s.countryOfResidence || "");
      setPrimaryLanguage(s.primaryLanguage || "English");
      setParentName(s.parentName || "");
      setParentPhone(s.parentPhone || "");
      setParentEmail(s.parentEmail || "");
      setParentOccupation(s.parentOccupation || "");
      setIsLoading(false);
    })();
  }, [enrollmentId]);

  const handleSave = async () => {
    if (!fullName || !gender || !dateOfBirth || !countryOfResidence || !primaryLanguage) {
      setError("Please fill in every required field");
      return;
    }

    setIsSaving(true);
    setError(null);
    setMessage(null);
    const [, err] = await UpdateEnrollmentAction(enrollmentId, {
      fullName,
      gender,
      dateOfBirth: new Date(dateOfBirth),
      phone,
      countryOfResidence,
      primaryLanguage,
      parentName,
      parentPhone,
      parentEmail,
      parentOccupation,
    });
    setIsSaving(false);
    if (err) {
      setError(err);
      return;
    }
    setMessage("Details updated.");
  };

  if (isLoading) return <p className="text-sm text-gray-500">Loading...</p>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold">Edit Details</h1>
        <p className="text-sm text-gray-600 mt-1">
          Update the information you provided when enrolling. Schedule and subject changes are handled separately.
        </p>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {message && <p className="text-sm text-blue-600">{message}</p>}

      <Card>
        <CardHeader>
          <CardTitle>{isStudentOwner ? "Your Information" : "Child Information"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select value={gender} onValueChange={setGender}>
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

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input id="dateOfBirth" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="countryOfResidence">Country of Residence *</Label>
              <SearchableCombobox
                options={countries.map((c) => ({ value: c.value, label: c.label }))}
                value={countryOfResidence}
                onChange={setCountryOfResidence}
                placeholder={isLoadingCountries ? "Loading countries..." : "Select country"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryLanguage">Primary Teaching Language *</Label>
              <Select value={primaryLanguage} onValueChange={setPrimaryLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Parent/Guardian Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="parentName">Parent/Guardian Name</Label>
              <Input id="parentName" value={parentName} onChange={(e) => setParentName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentPhone">Parent/Guardian Phone</Label>
              <Input id="parentPhone" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentEmail">Parent/Guardian Email</Label>
              <Input id="parentEmail" type="email" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentOccupation">Parent/Guardian Occupation</Label>
              <Input id="parentOccupation" value={parentOccupation} onChange={(e) => setParentOccupation(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
        <Button variant="outline" onClick={() => router.push(`${basePath}/${enrollmentId}`)} disabled={isSaving}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
