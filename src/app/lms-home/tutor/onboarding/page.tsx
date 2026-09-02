"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BrandLogo from "@/components/shared/BrandLogo";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import TeachingCombinationPicker from "@/components/teaching-combination-picker";
import { GetMyTutorProfileAction, UpdateMyTutorPreferencesAction } from "@/server/tutor-profile";
import { GetTaxonomyOptionsAction } from "@/server/taxonomy-option";
import { ITaxonomyOption, TaxonomyOptionKind } from "@/types/service-catalog";
import { TeachingCombination } from "@/types/curriculum";

// Mirrors stcbe's hasDeclaredWhatTheyTeach (tutor-profile.service.ts) - true
// once ANY of the wizard's "What You Teach" fields is populated, whether
// carried over from TutorApplication at approval or set here previously.
function hasDeclaredWhatTheyTeach(profile: {
  teachingCombinations?: unknown[];
  teachingCycles?: unknown[];
  digitalSkillsBundles?: unknown[];
  musicInstruments?: unknown[];
  softSkillsTopics?: unknown[];
  careerCoachingTopics?: unknown[];
  selfDevTopics?: unknown[];
  adultEdFocusAreas?: unknown[];
}): boolean {
  return (
    (profile.teachingCombinations?.length ?? 0) > 0 ||
    (profile.teachingCycles?.length ?? 0) > 0 ||
    (profile.digitalSkillsBundles?.length ?? 0) > 0 ||
    (profile.musicInstruments?.length ?? 0) > 0 ||
    (profile.softSkillsTopics?.length ?? 0) > 0 ||
    (profile.careerCoachingTopics?.length ?? 0) > 0 ||
    (profile.selfDevTopics?.length ?? 0) > 0 ||
    (profile.adultEdFocusAreas?.length ?? 0) > 0
  );
}

export default function TutorOnboardingPage() {
  const router = useRouter();
  const [teachingCombinations, setTeachingCombinations] = useState<TeachingCombination[]>([]);
  const [ageLevelsTaught, setAgeLevelsTaught] = useState<string[]>([]);
  const [ageLevelOptions, setAgeLevelOptions] = useState<ITaxonomyOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Whether "what you teach" already came from registration - if so, this
  // page has nothing left to ask but age levels, so the picker (and its
  // requirement) is skipped rather than making the tutor redo a step they
  // already completed at signup.
  const [alreadyDeclaredSubjects, setAlreadyDeclaredSubjects] = useState(false);

  useEffect(() => {
    Promise.all([GetTaxonomyOptionsAction(TaxonomyOptionKind.AGE_RANGE), GetMyTutorProfileAction()]).then(
      ([[optionsRes], [profileRes]]) => {
        setAgeLevelOptions(optionsRes?.data ?? []);
        const profile = profileRes?.data;
        if (profile) {
          setAlreadyDeclaredSubjects(hasDeclaredWhatTheyTeach(profile));
          setAgeLevelsTaught(profile.ageLevelsTaught ?? []);
        }
        setIsLoading(false);
      }
    );
  }, []);

  const handleExplore = async () => {
    if (!alreadyDeclaredSubjects && teachingCombinations.length === 0) {
      setError("Please add at least one subject");
      return;
    }
    setIsSaving(true);
    const [, err] = await UpdateMyTutorPreferencesAction({ teachingCombinations, ageLevelsTaught });
    setIsSaving(false);
    if (err) {
      setError(err);
      return;
    }
    router.push("/lms-home/tutor/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow p-8 space-y-6">
        <div className="flex justify-center">
          <BrandLogo width={140} height={48} className="object-contain" />
        </div>

        <div className="text-center">
          <h1 className="text-xl font-bold">
            {alreadyDeclaredSubjects ? "One more thing" : "Choose your Preference"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {alreadyDeclaredSubjects
              ? "Which age levels are you comfortable teaching?"
              : "Tell us what you teach so we can match you with the right students."}
          </p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {isLoading ? (
          <p className="text-sm text-gray-500 text-center">Loading...</p>
        ) : (
          <div className="space-y-4">
            {!alreadyDeclaredSubjects && (
              <div className="space-y-2">
                <Label>What you teach</Label>
                <TeachingCombinationPicker value={teachingCombinations} onChange={setTeachingCombinations} />
              </div>
            )}
            <div className="space-y-2">
              <Label>Age levels you teach</Label>
              <MultiSelect
                options={ageLevelOptions.map((o) => o.value)}
                value={ageLevelsTaught}
                onChange={setAgeLevelsTaught}
                placeholder="Select age levels"
              />
            </div>
          </div>
        )}

        <Button className="w-full" onClick={handleExplore} disabled={isSaving || isLoading}>
          {isSaving ? "Saving..." : "Explore"}
        </Button>

        <p className="text-xs text-gray-400 text-center">
          You can refine your bio, qualifications, and availability afterward in Profile Details.
        </p>
      </div>
    </div>
  );
}
