"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { GetMyTutorProfileAction, UpdateMyTutorProfileAction } from "@/server/tutor-profile";
import { TutorAvailabilitySlot, TutorEducationEntry } from "@/types/tutor-profile";
import { TeachingCombination } from "@/types/curriculum";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TeachingCombinationPicker from "@/components/teaching-combination-picker";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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

  const [slotSubject, setSlotSubject] = useState("");
  const [slotDays, setSlotDays] = useState<string[]>([]);
  const [slotTime, setSlotTime] = useState("");
  const [slotDuration, setSlotDuration] = useState("60");

  const [degree, setDegree] = useState("");
  const [institution, setInstitution] = useState("");
  const [year, setYear] = useState("");

  const taughtSubjects = Array.from(new Set(teachingCombinations.flatMap((c) => c.subjectsTaught)));

  useEffect(() => {
    (async () => {
      const [res] = await GetMyTutorProfileAction();
      const profile = res?.data;
      if (profile) {
        setBio(profile.bio || "");
        setTeachingCombinations(profile.teachingCombinations || []);
        setYearsOfExperience(profile.yearsOfExperience ? String(profile.yearsOfExperience) : "");
        setQualifications(profile.qualifications || "");
        setAvailability(profile.availability || []);
        setEducation(profile.education || []);
      }
      setIsLoading(false);
    })();
  }, []);

  const toggleSlotDay = (day: string) => {
    setSlotDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const addSlot = () => {
    if (!slotSubject || slotDays.length === 0 || !slotTime) return;
    setAvailability((prev) => [...prev, { subject: slotSubject, days: slotDays, time: slotTime, duration: Number(slotDuration) || 60 }]);
    setSlotSubject("");
    setSlotDays([]);
    setSlotTime("");
  };

  const removeSlot = (index: number) => {
    setAvailability((prev) => prev.filter((_, i) => i !== index));
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
      yearsOfExperience: yearsOfExperience ? Number(yearsOfExperience) : undefined,
      qualifications,
      education,
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
          This is what students and parents see on your public profile. Your phone number and email are never shown to
          them.
        </p>
      </div>

      {message && <p className="text-sm text-blue-600">{message}</p>}

      <Card>
        <CardHeader>
          <CardTitle>About you</CardTitle>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Education</CardTitle>
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
          <CardTitle>Availability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {availability.length > 0 && (
            <ul className="space-y-2">
              {availability.map((slot, i) => (
                <li key={i} className="flex items-center justify-between border rounded-md p-2 text-sm">
                  <span>
                    {slot.subject}: {slot.days.join(", ")} at {slot.time} ({slot.duration}min)
                  </span>
                  <button onClick={() => removeSlot(i)} className="text-red-600 text-xs hover:underline">
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="border-t pt-4 space-y-2">
            <Select value={slotSubject} onValueChange={setSlotSubject}>
              <SelectTrigger>
                <SelectValue placeholder={taughtSubjects.length ? "Select subject" : "Add what you teach above first"} />
              </SelectTrigger>
              <SelectContent>
                {taughtSubjects.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleSlotDay(d)}
                  className={`px-2 py-1 rounded-md text-xs border ${
                    slotDays.includes(d) ? "bg-gray-900 text-white border-gray-900" : "border-gray-300 text-gray-600"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Time (e.g. 16:00)" value={slotTime} onChange={(e) => setSlotTime(e.target.value)} />
              <Input type="number" min="1" placeholder="Duration (minutes)" value={slotDuration} onChange={(e) => setSlotDuration(e.target.value)} />
            </div>
            <Button type="button" variant="outline" onClick={addSlot}>
              Add availability slot
            </Button>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? "Saving..." : "Save profile"}
      </Button>
    </div>
  );
}
