"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchableCombobox } from "@/components/ui/searchable-combobox";
import { ToastError, ToastSuccess } from "@/components/ui/custom/toast";
import { GetMyChildProfileAction, UpdateChildProfileAction } from "@/server/child";
import { GetTaxonomyOptionsAction } from "@/server/taxonomy-option";
import { Child } from "@/types/child";
import { ITaxonomyOption, TaxonomyOptionKind } from "@/types/service-catalog";

// The details a self-registering student enters once, in the enrollment
// wizard's Student Information step, live on their Child record (see stcbe's
// ChildService.getOwnProfile) - this is where they're shown and edited
// afterward, instead of only ever being reachable by re-enrolling. Renders
// nothing until they've enrolled at least once, since there's no record yet.
export default function StudentPersonalDetailsForm() {
  const [profile, setProfile] = useState<Child | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [countries, setCountries] = useState<ITaxonomyOption[]>([]);
  const [languages, setLanguages] = useState<ITaxonomyOption[]>([]);
  const [form, setForm] = useState({ gender: "", dateOfBirth: "", countryOfResidence: "", primaryLanguage: "" });

  const fillForm = (child: Child) =>
    setForm({
      gender: child.gender || "",
      dateOfBirth: child.dateOfBirth ? new Date(child.dateOfBirth).toISOString().slice(0, 10) : "",
      countryOfResidence: child.countryOfResidence || "",
      primaryLanguage: child.primaryLanguage || "",
    });

  useEffect(() => {
    Promise.all([
      GetMyChildProfileAction(),
      GetTaxonomyOptionsAction(TaxonomyOptionKind.COUNTRY),
      GetTaxonomyOptionsAction(TaxonomyOptionKind.LANGUAGE),
    ]).then(([[profileRes], [countryRes], [languageRes]]) => {
      if (profileRes?.data) {
        setProfile(profileRes.data);
        fillForm(profileRes.data);
      }
      setCountries(countryRes?.data ?? []);
      setLanguages(languageRes?.data ?? []);
      setIsLoading(false);
    });
  }, []);

  if (isLoading || !profile) return null;

  const handleSave = async () => {
    setIsSaving(true);
    // Only send what has a value - the backend rejects an empty country/
    // language/gender outright rather than treating it as "clear this field".
    const payload = Object.fromEntries(Object.entries(form).filter(([, value]) => value));
    const [res, error] = await UpdateChildProfileAction(profile.id, payload);
    setIsSaving(false);
    if (res?.data) {
      setProfile(res.data);
      fillForm(res.data);
      ToastSuccess("Personal details updated");
    } else {
      ToastError(error || "Failed to update personal details");
    }
  };

  const countryOptions = countries.map((c) => ({ value: c.value, label: c.label }));
  const languageOptions = languages.map((l) => ({ value: l.value, label: l.label }));

  return (
    <section className="bg-white rounded-2xl shadow p-6 max-w-2xl">
      <h2 className="font-bold text-lg mb-1">Personal details</h2>
      <p className="text-sm text-gray-500 mb-4">
        Saved from your first enrollment and reused for every service you enroll in, so you only enter them once.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="profile-gender">Gender</Label>
          <Select value={form.gender} onValueChange={(value) => setForm((prev) => ({ ...prev, gender: value }))}>
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
            onChange={(e) => setForm((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-country">Country of residence</Label>
          <SearchableCombobox
            options={countryOptions}
            value={form.countryOfResidence}
            onChange={(value) => setForm((prev) => ({ ...prev, countryOfResidence: value }))}
            placeholder="Select country"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-language">Primary teaching language</Label>
          <SearchableCombobox
            options={languageOptions}
            value={form.primaryLanguage}
            onChange={(value) => setForm((prev) => ({ ...prev, primaryLanguage: value }))}
            placeholder="Select language"
          />
        </div>
      </div>

      <Button type="button" className="mt-4" onClick={handleSave} disabled={isSaving}>
        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save personal details
      </Button>
    </section>
  );
}
