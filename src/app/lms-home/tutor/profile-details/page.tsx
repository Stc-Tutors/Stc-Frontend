"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchableCombobox } from "@/components/ui/searchable-combobox";
import { X } from "lucide-react";
import { GetMyTutorProfileAction, UpdateMyTutorProfileAction } from "@/server/tutor-profile";
import { GetTaxonomyOptionsAction } from "@/server/taxonomy-option";
import { ITaxonomyOption, TaxonomyOptionKind } from "@/types/service-catalog";
import { TutorAvailabilitySlot, TutorEducationEntry } from "@/types/tutor-profile";
import { TeachingCombination } from "@/types/curriculum";
import TeachingCombinationPicker from "@/components/teaching-combination-picker";
import FileUploadField from "@/components/ui/custom/file-upload-field";
import MyApplicationRecord from "@/components/tutor-applications/my-application-record";
import { UploadedFile } from "@/lib/cloudinary-upload";
import {
  CERTIFICATION_PROOF_UPLOAD_LIMITS,
  CV_UPLOAD_LIMITS,
  GOV_ID_UPLOAD_LIMITS,
  SUPPORTING_DOCUMENTS_UPLOAD_LIMITS,
} from "@/constants/upload-limits";
import {
  CLASS_FORMAT_LABELS,
  InternetSpeedTier,
  MAX_WEEKLY_HOURS_LABELS,
  MaxWeeklyHoursBand,
  PAYOUT_METHOD_LABELS,
  PayoutMethod,
  TEACHING_CERTIFICATION_NONE,
  TutorClassFormat,
} from "@/types/tutor-application";

import { WEEKDAYS, Weekday } from "@/constants/weekdays";

const DEFAULT_START_TIME = "09:00";
const DEFAULT_END_TIME = "17:00";

const SPEED_LABELS: Record<InternetSpeedTier, string> = {
  [InternetSpeedTier.BELOW_5MBPS]: "Below 5 Mbps",
  [InternetSpeedTier.BETWEEN_5_10MBPS]: "5 - 10 Mbps",
  [InternetSpeedTier.ABOVE_10MBPS]: "Above 10 Mbps",
};

export default function TutorProfileDetailsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [bio, setBio] = useState("");
  const [teachingCombinations, setTeachingCombinations] = useState<TeachingCombination[]>([]);
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [availability, setAvailability] = useState<TutorAvailabilitySlot[]>([]);
  const [education, setEducation] = useState<TutorEducationEntry[]>([]);
  const [maxWeeklyHours, setMaxWeeklyHours] = useState<MaxWeeklyHoursBand | "">("");
  const [preferredClassFormat, setPreferredClassFormat] = useState<TutorClassFormat | "">("");

  // Public-facing (shown to parents/students alongside qualifications/experience).
  const [preferredLanguages, setPreferredLanguages] = useState<string[]>([]);
  const [otherCertifications, setOtherCertifications] = useState<string[]>([]);

  // Tutor-facing only - never shown on the public profile.
  const [countryOfResidence, setCountryOfResidence] = useState("");
  const [govIdFile, setGovIdFile] = useState<UploadedFile | undefined>(undefined);
  const [cvFile, setCvFile] = useState<UploadedFile | undefined>(undefined);
  const [supportingDocumentsFile, setSupportingDocumentsFile] = useState<UploadedFile | undefined>(undefined);
  const [certificationProofs, setCertificationProofs] = useState<Partial<Record<string, UploadedFile>>>({});
  const [devices, setDevices] = useState<string[]>([]);
  const [internetSpeed, setInternetSpeed] = useState<InternetSpeedTier | "">("");
  const [toolProficiency, setToolProficiency] = useState<string[]>([]);
  const [toolInput, setToolInput] = useState("");
  const [hasQuietEnvironment, setHasQuietEnvironment] = useState(false);
  const [hasPeripherals, setHasPeripherals] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethod | "">("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");

  const [degree, setDegree] = useState("");
  const [institution, setInstitution] = useState("");
  const [year, setYear] = useState("");

  const [countries, setCountries] = useState<ITaxonomyOption[]>([]);
  const [languages, setLanguages] = useState<ITaxonomyOption[]>([]);
  const [certificationOptions, setCertificationOptions] = useState<ITaxonomyOption[]>([]);
  const [deviceOptions, setDeviceOptions] = useState<ITaxonomyOption[]>([]);

  const certificationsNeedingProof = otherCertifications.filter((c) => c !== TEACHING_CERTIFICATION_NONE);
  const isBankTransfer = payoutMethod === PayoutMethod.BANK_TRANSFER_NIGERIA;

  useEffect(() => {
    (async () => {
      const [[res], [countryRes], [languageRes], [certificationRes], [deviceRes]] = await Promise.all([
        GetMyTutorProfileAction(),
        GetTaxonomyOptionsAction(TaxonomyOptionKind.COUNTRY),
        GetTaxonomyOptionsAction(TaxonomyOptionKind.LANGUAGE),
        GetTaxonomyOptionsAction(TaxonomyOptionKind.TEACHING_CERTIFICATION),
        GetTaxonomyOptionsAction(TaxonomyOptionKind.TUTOR_DEVICE_TYPE),
      ]);
      setCountries(countryRes?.data ?? []);
      setLanguages(languageRes?.data ?? []);
      setCertificationOptions(certificationRes?.data ?? []);
      setDeviceOptions(deviceRes?.data ?? []);

      const profile = res?.data;
      if (profile) {
        setBio(profile.bio || "");
        setTeachingCombinations(profile.teachingCombinations || []);
        setYearsOfExperience(profile.yearsOfExperience ? String(profile.yearsOfExperience) : "");
        setQualifications(profile.qualifications || "");
        setAvailability(profile.availability || []);
        setEducation(profile.education || []);
        setMaxWeeklyHours(profile.maxWeeklyHours || "");
        setPreferredClassFormat(profile.preferredClassFormat || "");
        setPreferredLanguages(profile.preferredLanguages || []);
        setOtherCertifications(profile.otherCertifications || []);
        setCountryOfResidence(profile.countryOfResidence || "");
        setGovIdFile(profile.govIdFile);
        setCvFile(profile.cvFile);
        setSupportingDocumentsFile(profile.supportingDocumentsFile);
        const proofs: Partial<Record<string, UploadedFile>> = {};
        for (const proof of profile.certificationProofs || []) proofs[proof.certification] = proof.file;
        setCertificationProofs(proofs);
        setDevices(profile.devices || []);
        setInternetSpeed(profile.internetSpeed || "");
        setToolProficiency(profile.toolProficiency || []);
        setHasQuietEnvironment(profile.hasQuietEnvironment ?? false);
        setHasPeripherals(profile.hasPeripherals ?? false);
        setPayoutMethod(profile.payoutMethod || "");
        setBankName(profile.bankName || "");
        setAccountNumber(profile.accountNumber || "");
        setAccountName(profile.accountName || "");
      }
      setIsLoading(false);
    })();
  }, []);

  const toggleAvailabilityDay = (day: Weekday) => {
    setAvailability((prev) =>
      prev.some((slot) => slot.dayOfWeek === day)
        ? prev.filter((slot) => slot.dayOfWeek !== day)
        : [...prev, { dayOfWeek: day, startTime: DEFAULT_START_TIME, endTime: DEFAULT_END_TIME }]
    );
  };

  const updateAvailabilityDayTime = (day: Weekday, field: "startTime" | "endTime", value: string) => {
    setAvailability((prev) => prev.map((slot) => (slot.dayOfWeek === day ? { ...slot, [field]: value } : slot)));
  };

  const toggleLanguage = (value: string) => {
    setPreferredLanguages((prev) => (prev.includes(value) ? prev.filter((l) => l !== value) : [...prev, value]));
  };

  const toggleCertification = (cert: string) => {
    setOtherCertifications((prev) => (prev.includes(cert) ? prev.filter((c) => c !== cert) : [...prev, cert]));
  };

  const toggleDevice = (device: string) => {
    setDevices((prev) => (prev.includes(device) ? prev.filter((d) => d !== device) : [...prev, device]));
  };

  const addTool = () => {
    const value = toolInput.trim();
    if (!value || toolProficiency.includes(value)) {
      setToolInput("");
      return;
    }
    setToolProficiency((prev) => [...prev, value]);
    setToolInput("");
  };

  const removeTool = (tool: string) => {
    setToolProficiency((prev) => prev.filter((t) => t !== tool));
  };

  const addEducation = () => {
    if (!degree) return;
    setEducation((prev) => [...prev, { degree, institution: institution || undefined, year: year ? Number(year) : undefined }]);
    setDegree("");
    setInstitution("");
    setYear("");
  };

  const removeEducation = (index: number) => {
    setEducation((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const [, error] = await UpdateMyTutorProfileAction({
      bio,
      teachingCombinations,
      availability,
      // Captured silently (no picker UI) so the Smart Tutor Suggestion Engine
      // can resolve a real UTC instant for these availability times.
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      maxWeeklyHours: maxWeeklyHours || undefined,
      preferredClassFormat: preferredClassFormat || undefined,
      yearsOfExperience: yearsOfExperience ? Number(yearsOfExperience) : undefined,
      qualifications,
      education,
      preferredLanguages,
      otherCertifications,
      countryOfResidence: countryOfResidence || undefined,
      govIdFile,
      cvFile,
      supportingDocumentsFile,
      certificationProofs: certificationsNeedingProof
        .filter((cert) => certificationProofs[cert])
        .map((cert) => ({ certification: cert, file: certificationProofs[cert]! })),
      devices,
      internetSpeed: internetSpeed || undefined,
      toolProficiency,
      hasQuietEnvironment,
      hasPeripherals,
      payoutMethod: payoutMethod || undefined,
      bankName: isBankTransfer ? bankName : undefined,
      accountNumber: isBankTransfer ? accountNumber : undefined,
      accountName: isBankTransfer ? accountName : undefined,
    });
    setIsSaving(false);
    setMessage(error || "Profile saved. Students and parents will see this on your public profile.");
  };

  if (isLoading) return <p className="text-sm text-gray-500">Loading...</p>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold">My Profile Details</h1>
        <p className="text-sm text-gray-600 mt-1">
          Sections marked "public" are what students and parents see on your profile. Everything else (documents,
          technical setup, payment details) is visible only to you and STC admins. Your phone number and email are
          never shown publicly.
        </p>
      </div>

      {message && <p className="text-sm text-blue-600">{message}</p>}

      <Card>
        <CardHeader>
          <CardTitle>About you (public)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell students and parents about your teaching style and experience" />
          </div>
          <div className="space-y-2">
            <Label>What you teach</Label>
            <TeachingCombinationPicker value={teachingCombinations} onChange={setTeachingCombinations} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="yearsOfExperience">Years of experience</Label>
              <Input id="yearsOfExperience" type="number" min="0" value={yearsOfExperience} onChange={(e) => setYearsOfExperience(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qualifications">Qualifications</Label>
              <Input id="qualifications" value={qualifications} onChange={(e) => setQualifications(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Preferred language(s)</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {languages.map((lang) => (
                <label key={lang.id} className="flex items-center space-x-2 text-sm">
                  <Checkbox checked={preferredLanguages.includes(lang.value)} onCheckedChange={() => toggleLanguage(lang.value)} />
                  <span>{lang.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Certifications</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {certificationOptions.map((opt) => (
                <label key={opt.id} className="flex items-center space-x-2 text-sm">
                  <Checkbox checked={otherCertifications.includes(opt.value)} onCheckedChange={() => toggleCertification(opt.value)} />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Education (public)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {education.length > 0 && (
            <ul className="space-y-2">
              {education.map((entry, i) => (
                <li key={i} className="flex items-center justify-between border rounded-md p-2 text-sm">
                  <span>
                    {entry.degree}
                    {entry.institution ? ` — ${entry.institution}` : ""}
                    {entry.year ? ` (${entry.year})` : ""}
                  </span>
                  <button onClick={() => removeEducation(i)} className="text-red-600 text-xs hover:underline">
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-3 gap-2">
            <Input placeholder="Degree (e.g. B.Sc Mathematics)" value={degree} onChange={(e) => setDegree(e.target.value)} />
            <Input placeholder="Institution" value={institution} onChange={(e) => setInstitution(e.target.value)} />
            <Input type="number" placeholder="Year" value={year} onChange={(e) => setYear(e.target.value)} />
          </div>
          <Button type="button" variant="outline" onClick={addEducation}>
            Add education entry
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Availability (public)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500">
            Set the general hours you're open to teach, for each day you're available. Not tied to any particular
            subject - students are fit into these windows and rescheduled within them as needed.
          </p>
          <div className="space-y-2">
            {WEEKDAYS.map((day) => {
              const slot = availability.find((s) => s.dayOfWeek === day);
              return (
                <div key={day} className="flex items-center gap-3 border rounded-md p-2">
                  <Checkbox id={`day-${day}`} checked={Boolean(slot)} onCheckedChange={() => toggleAvailabilityDay(day)} />
                  <Label htmlFor={`day-${day}`} className="w-24 text-sm">
                    {day}
                  </Label>
                  {slot && (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => updateAvailabilityDayTime(day, "startTime", e.target.value)}
                        className="max-w-[140px]"
                      />
                      <span className="text-sm text-gray-500">to</span>
                      <Input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => updateAvailabilityDayTime(day, "endTime", e.target.value)}
                        className="max-w-[140px]"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxWeeklyHours">Maximum hours/week available</Label>
              <Select value={maxWeeklyHours} onValueChange={(v) => setMaxWeeklyHours(v as MaxWeeklyHoursBand)}>
                <SelectTrigger id="maxWeeklyHours">
                  <SelectValue placeholder="Select a range" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(MaxWeeklyHoursBand).map((band) => (
                    <SelectItem key={band} value={band}>
                      {MAX_WEEKLY_HOURS_LABELS[band]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferredClassFormat">Preferred class format</Label>
              <Select value={preferredClassFormat} onValueChange={(v) => setPreferredClassFormat(v as TutorClassFormat)}>
                <SelectTrigger id="preferredClassFormat">
                  <SelectValue placeholder="Select a format" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(TutorClassFormat).map((format) => (
                    <SelectItem key={format} value={format}>
                      {CLASS_FORMAT_LABELS[format]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="countryOfResidence">Country of residence</Label>
            <SearchableCombobox
              options={countries.map((c) => ({ value: c.value, label: c.label }))}
              value={countryOfResidence}
              onChange={setCountryOfResidence}
              placeholder="Select country"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Government-issued ID</Label>
            <FileUploadField id="govIdUpload" folder="tutor-applications/gov-id" limits={GOV_ID_UPLOAD_LIMITS} value={govIdFile} onChange={setGovIdFile} />
          </div>
          <div className="space-y-2">
            <Label>CV/Resume</Label>
            <FileUploadField id="cvUpload" folder="tutor-applications/cv" limits={CV_UPLOAD_LIMITS} value={cvFile} onChange={setCvFile} />
          </div>
          <div className="space-y-2">
            <Label>Additional certificates/supporting documents</Label>
            <FileUploadField
              id="supportingDocumentsUpload"
              folder="tutor-applications/supporting-documents"
              limits={SUPPORTING_DOCUMENTS_UPLOAD_LIMITS}
              value={supportingDocumentsFile}
              onChange={setSupportingDocumentsFile}
            />
          </div>
          {certificationsNeedingProof.map((cert) => (
            <div key={cert} className="space-y-2">
              <Label>Proof of {cert}</Label>
              <FileUploadField
                id={`certProof_${cert}`}
                folder="tutor-applications/cert-proof"
                limits={CERTIFICATION_PROOF_UPLOAD_LIMITS}
                value={certificationProofs[cert]}
                onChange={(file) => setCertificationProofs((prev) => ({ ...prev, [cert]: file }))}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Technical Readiness</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Devices you teach from</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {deviceOptions.map((opt) => (
                <label key={opt.id} className="flex items-center space-x-2 text-sm">
                  <Checkbox checked={devices.includes(opt.value)} onCheckedChange={() => toggleDevice(opt.value)} />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Internet speed</Label>
            <RadioGroup value={internetSpeed} onValueChange={(v) => setInternetSpeed(v as InternetSpeedTier)}>
              {Object.values(InternetSpeedTier).map((tier) => (
                <div key={tier} className="flex items-center space-x-2">
                  <RadioGroupItem value={tier} id={tier} />
                  <Label htmlFor={tier} className="font-normal cursor-pointer">
                    {SPEED_LABELS[tier]}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="toolInput">Tools you're comfortable using</Label>
            <Input
              id="toolInput"
              value={toolInput}
              onChange={(e) => setToolInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addTool();
                }
              }}
              placeholder="e.g. Zoom, Google Classroom - press Enter to add"
            />
            {toolProficiency.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {toolProficiency.map((tool) => (
                  <Badge key={tool} variant="secondary" className="flex items-center gap-1">
                    {tool}
                    <span role="button" tabIndex={-1} onClick={() => removeTool(tool)} className="cursor-pointer">
                      <X className="h-3 w-3" />
                    </span>
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <Checkbox checked={hasQuietEnvironment} onCheckedChange={(c) => setHasQuietEnvironment(c as boolean)} />
              <span className="text-sm">I have access to a quiet environment for teaching</span>
            </label>
            <label className="flex items-center space-x-2">
              <Checkbox checked={hasPeripherals} onCheckedChange={(c) => setHasPeripherals(c as boolean)} />
              <span className="text-sm">I have a working webcam, microphone and headset</span>
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payoutMethod">Preferred payout method</Label>
            <Select value={payoutMethod} onValueChange={(v) => setPayoutMethod(v as PayoutMethod)}>
              <SelectTrigger id="payoutMethod">
                <SelectValue placeholder="Select a payout method" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(PayoutMethod).map((method) => (
                  <SelectItem key={method} value={method}>
                    {PAYOUT_METHOD_LABELS[method]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {isBankTransfer && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank name</Label>
                <Input id="bankName" value={bankName} onChange={(e) => setBankName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account number</Label>
                <Input id="accountNumber" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountName">Account holder name</Label>
                <Input id="accountName" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? "Saving..." : "Save profile"}
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Your Registration Record</CardTitle>
        </CardHeader>
        <CardContent>
          <MyApplicationRecord />
        </CardContent>
      </Card>
    </div>
  );
}
