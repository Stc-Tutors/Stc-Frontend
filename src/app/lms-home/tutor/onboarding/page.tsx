"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BrandLogo from "@/components/shared/BrandLogo";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import TeachingCombinationPicker from "@/components/teaching-combination-picker";
import { UpdateMyTutorPreferencesAction } from "@/server/tutor-profile";
import { GetTaxonomyOptionsAction } from "@/server/taxonomy-option";
import { ITaxonomyOption, TaxonomyOptionKind } from "@/types/service-catalog";
import { TeachingCombination } from "@/types/curriculum";

export default function TutorOnboardingPage() {
  const router = useRouter();
  const [teachingCombinations, setTeachingCombinations] = useState<TeachingCombination[]>([]);
  const [ageLevelsTaught, setAgeLevelsTaught] = useState<string[]>([]);
  const [ageLevelOptions, setAgeLevelOptions] = useState<ITaxonomyOption[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    GetTaxonomyOptionsAction(TaxonomyOptionKind.AGE_RANGE).then(([res]) => setAgeLevelOptions(res?.data ?? []));
  }, []);

  const handleExplore = async () => {
    if (teachingCombinations.length === 0) {
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
          <h1 className="text-xl font-bold">Choose your Preference</h1>
          <p className="text-sm text-gray-500 mt-1">
            Tell us what you teach so we can match you with the right students.
          </p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>What you teach</Label>
            <TeachingCombinationPicker value={teachingCombinations} onChange={setTeachingCombinations} />
          </div>
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

        <Button className="w-full" onClick={handleExplore} disabled={isSaving}>
          {isSaving ? "Saving..." : "Explore"}
        </Button>

        <p className="text-xs text-gray-400 text-center">
          You can refine your bio, qualifications, and availability afterward in Profile Details.
        </p>
      </div>
    </div>
  );
}
