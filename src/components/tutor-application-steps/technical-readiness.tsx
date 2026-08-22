"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { X } from "lucide-react";
import { useTutorApplication } from "@/contexts/tutor-application-context";
import { useCustomFormFields } from "@/hooks/use-custom-form-fields";
import DynamicQuestionField from "@/components/forms/dynamic-question-field";
import { GetTaxonomyOptionsAction } from "@/server/taxonomy-option";
import { ITaxonomyOption, TaxonomyOptionKind } from "@/types/service-catalog";
import { InternetSpeedTier, TutorApplicationStep5Payload } from "@/types/tutor-application";

interface StepProps {
  onNext: (errors: Record<string, string>, data?: TutorApplicationStep5Payload) => void;
  errors: Record<string, string>;
}

const SPEED_LABELS: Record<InternetSpeedTier, string> = {
  [InternetSpeedTier.BELOW_5MBPS]: "Below 5 Mbps",
  [InternetSpeedTier.BETWEEN_5_10MBPS]: "5 - 10 Mbps",
  [InternetSpeedTier.ABOVE_10MBPS]: "Above 10 Mbps",
};

const STAGE = "tutor-onboarding:technical-readiness" as const;

export default function TechnicalReadinessStep({ onNext, errors }: StepProps) {
  const { draft, updateCustomFieldResponse } = useTutorApplication();

  const [devices, setDevices] = useState<string[]>(draft.step5.devices || []);
  const [internetSpeed, setInternetSpeed] = useState<InternetSpeedTier | "">(draft.step5.internetSpeed || "");
  const [toolProficiency, setToolProficiency] = useState<string[]>(draft.step5.toolProficiency || []);
  const [toolInput, setToolInput] = useState("");
  const [hasQuietEnvironment, setHasQuietEnvironment] = useState(draft.step5.hasQuietEnvironment ?? false);
  const [hasPeripherals, setHasPeripherals] = useState(draft.step5.hasPeripherals ?? false);
  const [deviceOptions, setDeviceOptions] = useState<ITaxonomyOption[]>([]);
  const [toolSuggestions, setToolSuggestions] = useState<ITaxonomyOption[]>([]);

  const { fields: customFields } = useCustomFormFields(STAGE);
  const customFieldResponses = draft.customFieldResponses;

  useEffect(() => {
    Promise.all([
      GetTaxonomyOptionsAction(TaxonomyOptionKind.TUTOR_DEVICE_TYPE),
      GetTaxonomyOptionsAction(TaxonomyOptionKind.TOOL_PROFICIENCY),
    ]).then(([devices, tools]) => {
      setDeviceOptions(devices[0]?.data ?? []);
      setToolSuggestions(tools[0]?.data ?? []);
    });
  }, []);

  const toggleDevice = (device: string) => {
    setDevices((prev) => (prev.includes(device) ? prev.filter((d) => d !== device) : [...prev, device]));
  };

  const addSuggestedTool = (tool: string) => {
    if (toolProficiency.includes(tool)) return;
    setToolProficiency((prev) => [...prev, tool]);
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

  useEffect(() => {
    const handleValidation = () => {
      const stepErrors: Record<string, string> = {};

      if (devices.length === 0) stepErrors.devices = "Please select at least one device you'll teach from";
      if (!internetSpeed) stepErrors.internetSpeed = "Please select your internet speed";
      if (toolProficiency.length === 0) stepErrors.toolProficiency = "Please add at least one tool you're comfortable using";

      for (const field of customFields) {
        if (field.required) {
          const value = customFieldResponses[field.id];
          const isEmpty = value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
          if (isEmpty) stepErrors[`custom_${field.id}`] = `${field.label} is required`;
        }
      }

      if (Object.keys(stepErrors).length === 0) {
        onNext(stepErrors, {
          devices,
          internetSpeed: internetSpeed as InternetSpeedTier,
          toolProficiency,
          hasQuietEnvironment,
          hasPeripherals,
        });
      } else {
        onNext(stepErrors);
      }
    };

    window.addEventListener("validateStep", handleValidation);
    return () => window.removeEventListener("validateStep", handleValidation);
  }, [devices, internetSpeed, toolProficiency, hasQuietEnvironment, hasPeripherals, customFields, customFieldResponses, onNext]);

  return (
    <div className="space-y-6 w-full">
      <Card>
        <CardHeader>
          <CardTitle>Devices & Connectivity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Which devices will you teach from? *</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {deviceOptions.map((opt) => (
                <label key={opt.id} className="flex items-center space-x-2 text-sm">
                  <Checkbox checked={devices.includes(opt.value)} onCheckedChange={() => toggleDevice(opt.value)} />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
            {errors.devices && <p className="text-red-600 text-sm">{errors.devices}</p>}
          </div>

          <div className="space-y-2">
            <Label>Internet Speed *</Label>
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
            {errors.internetSpeed && <p className="text-red-600 text-sm">{errors.internetSpeed}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tools & Environment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="toolInput">Tools You're Comfortable Using *</Label>
            <div className="flex gap-2">
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
                className={errors.toolProficiency ? "border-red-500" : ""}
              />
            </div>
            {toolSuggestions.filter((opt) => !toolProficiency.includes(opt.value)).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {toolSuggestions
                  .filter((opt) => !toolProficiency.includes(opt.value))
                  .map((opt) => (
                    <Badge
                      key={opt.id}
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => addSuggestedTool(opt.value)}
                    >
                      + {opt.label}
                    </Badge>
                  ))}
              </div>
            )}
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
            {errors.toolProficiency && <p className="text-red-600 text-sm">{errors.toolProficiency}</p>}
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

      {customFields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {customFields.map((field) => (
              <DynamicQuestionField
                key={field.id}
                field={field}
                value={customFieldResponses[field.id]}
                onChange={(value) => updateCustomFieldResponse(field.id, value)}
                error={errors[`custom_${field.id}`]}
              />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
