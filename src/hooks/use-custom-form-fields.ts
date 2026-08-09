"use client";

// Task 6 - fetches the active custom questions for one enrollment wizard
// stage (optionally narrowed to the selected service), so a step component
// just does `const { fields } = useCustomFormFields(stage, serviceType)` and
// renders <DynamicQuestionField> for each rather than special-casing
// anything about what a Super Admin has configured.

import { useEffect, useState } from "react";
import { GetCustomFormFieldsAction } from "@/server/custom-form-field";
import { CustomFormStage, ICustomFormField } from "@/types/service-catalog";

export function useCustomFormFields(stage: CustomFormStage, serviceType?: string) {
  const [fields, setFields] = useState<ICustomFormField[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    GetCustomFormFieldsAction(stage, serviceType).then(([res]) => {
      if (cancelled) return;
      const sorted = [...(res?.data ?? [])].sort((a, b) => a.order - b.order);
      setFields(sorted);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [stage, serviceType]);

  return { fields, isLoading };
}
