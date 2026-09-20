"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchableCombobox } from "@/components/ui/searchable-combobox";
import { ToastError, ToastSuccess } from "@/components/ui/custom/toast";
import { GetMyChildProfileAction, UpdateMyChildProfileAction } from "@/server/child";
import { GetTaxonomyOptionsAction } from "@/server/taxonomy-option";
import { Child } from "@/types/child";
import { ITaxonomyOption, TaxonomyOptionKind } from "@/types/service-catalog";

// Same cut-off as the enrollment wizard's Student Information step
// (steps/child-info.tsx) - below it, a parent/guardian's contact has to be on file.
const PARENT_INFO_REQUIRED_UNDER_AGE = 16;

const EMPTY_FORM = {
  gender: "",
  dateOfBirth: "",
  countryOfResidence: "",
  primaryLanguage: "",
  nationality: "",
  grade: "",
  parentName: "",
  parentPhone: "",
  parentEmail: "",
};
type FormState = typeof EMPTY_FORM;

function calculateAge(dateOfBirth: string): number | null {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

function childToForm(child: Child): FormState {
  return {
    gender: child.gender || "",
    dateOfBirth: child.dateOfBirth ? new Date(child.dateOfBirth).toISOString().slice(0, 10) : "",
    countryOfResidence: child.countryOfResidence || "",
    primaryLanguage: child.primaryLanguage || "",
    nationality: child.nationality || "",
    grade: child.grade || "",
    parentName: child.parentName || "",
    parentPhone: child.parentPhone || "",
    parentEmail: child.parentEmail || "",
  };
}

// The details a self-registering student gives once - in the enrollment
// wizard's Student Information step or right here - live on their Child
// record (see stcbe's ChildService.updateOwnProfile) and are reused by every
// enrollment after, so they only ever enter them once. Saving here before a
// first enrollment creates that record; the wizard then picks it up.
export default function StudentPersonalDetailsForm() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [countries, setCountries] = useState<ITaxonomyOption[]>([]);
  const [languages, setLanguages] = useState<ITaxonomyOption[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const setField = (field: keyof FormState, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  useEffect(() => {
    Promise.all([
      GetMyChildProfileAction(),
      GetTaxonomyOptionsAction(TaxonomyOptionKind.COUNTRY),
      GetTaxonomyOptionsAction(TaxonomyOptionKind.LANGUAGE),
    ]).then(([[profileRes], [countryRes], [languageRes]]) => {
      if (profileRes?.data) setForm(childToForm(profileRes.data));
      setCountries(countryRes?.data ?? []);
      setLanguages(languageRes?.data ?? []);
      setIsLoading(false);
    });
  }, []);

  const age = calculateAge(form.dateOfBirth);
  // Also shown while there's no DOB yet - we can't tell they're an adult.
  const showParentInfo = age === null || age < PARENT_INFO_REQUIRED_UNDER_AGE;

  const handleSave = async () => {
    if (form.parentEmail && !/\S+@\S+\.\S+/.test(form.parentEmail)) {
      ToastError("Please enter a valid parent/guardian email address");
      return;
    }

    setIsSaving(true);
    // Only send what has a value - the backend rejects an empty country/
    // language/grade outright rather than treating it as "clear this field".
    const payload = Object.fromEntries(Object.entries(form).filter(([, value]) => value.trim()));
    const [res, error] = await UpdateMyChildProfileAction(payload);
    setIsSaving(false);
    if (res?.data) {
      setForm(childToForm(res.data));
      ToastSuccess("Personal details updated");
    } else {
      ToastError(error || "Failed to update personal details");
    }
  };

  if (isLoading) return null;

  const countryOptions = countries.map((c) => ({ value: c.value, label: c.label }));
  const languageOptions = languages.map((l) => ({ value: l.value, label: l.label }));

  return (
    <section className="bg-white rounded-2xl shadow p-6 max-w-2xl">
      <h2 className="font-bold text-lg mb-1">Personal details</h2>
      <p className="text-sm text-gray-500 mb-4">
        Saved once and reused every time you enroll in a service, so you won&apos;t be asked for them again.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="profile-gender">Gender</Label>
          <Select value={form.gender} onValueChange={(value) => setField("gender", value)}>
            <SelectTrigger id="profile-gender">
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
          <Label htmlFor="profile-dob">Date of birth</Label>
          <Input
            id="profile-dob"
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => setField("dateOfBirth", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-country">Country of residence</Label>
          <SearchableCombobox
            options={countryOptions}
            value={form.countryOfResidence}
            onChange={(value) => setField("countryOfResidence", value)}
            placeholder="Select country"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-language">Primary teaching language</Label>
          <SearchableCombobox
            options={languageOptions}
            value={form.primaryLanguage}
            onChange={(value) => setField("primaryLanguage", value)}
            placeholder="Select language"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-nationality">Nationality</Label>
          <Input
            id="profile-nationality"
            value={form.nationality}
            onChange={(e) => setField("nationality", e.target.value)}
            placeholder="e.g. Nigerian"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-grade">Current grade / class</Label>
          <Input
            id="profile-grade"
            value={form.grade}
            onChange={(e) => setField("grade", e.target.value)}
            placeholder="e.g. Grade 10"
          />
        </div>
      </div>

      {showParentInfo && (
        <div className="mt-6">
          <h3 className="font-semibold mb-1">Parent / Guardian</h3>
          <p className="text-sm text-gray-500 mb-3">
            Needed for students under {PARENT_INFO_REQUIRED_UNDER_AGE}, so we can reach a parent or guardian.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="profile-parent-name">Name</Label>
              <Input
                id="profile-parent-name"
                value={form.parentName}
                onChange={(e) => setField("parentName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-parent-phone">Phone</Label>
              <Input
                id="profile-parent-phone"
                value={form.parentPhone}
                onChange={(e) => setField("parentPhone", e.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="profile-parent-email">Email</Label>
              <Input
                id="profile-parent-email"
                type="email"
                value={form.parentEmail}
                onChange={(e) => setField("parentEmail", e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      <Button type="button" className="mt-6" onClick={handleSave} disabled={isSaving}>
        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save personal details
      </Button>
    </section>
  );
}
