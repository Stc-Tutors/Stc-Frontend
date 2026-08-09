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
import { InternetSpeedTier, TutorApplicationStep3Payload, TutorDeviceType } from "@/types/tutor-application";

interface StepProps {
  onNext: (errors: Record<string, string>, data?: TutorApplicationStep3Payload) => void;
  errors: Record<string, string>;
}

const DEVICE_LABELS: Record<TutorDeviceType, string> = {
  [TutorDeviceType.PC]: "Desktop PC",
  [TutorDeviceType.LAPTOP]: "Laptop",
  [TutorDeviceType.TABLET]: "Tablet",
  [TutorDeviceType.SMARTPHONE]: "Smartphone",
};

const SPEED_LABELS: Record<InternetSpeedTier, string> = {
  [InternetSpeedTier.BELOW_5MBPS]: "Below 5 Mbps",
  [InternetSpeedTier.BETWEEN_5_10MBPS]: "5 - 10 Mbps",
  [InternetSpeedTier.ABOVE_10MBPS]: "Above 10 Mbps",
};

export default function TechnicalReadinessStep({ onNext, errors }: StepProps) {
  const { draft } = useTutorApplication();

  const [devices, setDevices] = useState<TutorDeviceType[]>(draft.step3.devices || []);
  const [internetSpeed, setInternetSpeed] = useState<InternetSpeedTier | "">(draft.step3.internetSpeed || "");
  const [toolProficiency, setToolProficiency] = useState<string[]>(draft.step3.toolProficiency || []);
  const [toolInput, setToolInput] = useState("");
  const [hasQuietEnvironment, setHasQuietEnvironment] = useState(draft.step3.hasQuietEnvironment ?? false);
  const [hasPeripherals, setHasPeripherals] = useState(draft.step3.hasPeripherals ?? false);

  const toggleDevice = (device: TutorDeviceType) => {
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

  useEffect(() => {
    const handleValidation = () => {
      const stepErrors: Record<string, string> = {};

      if (devices.length === 0) stepErrors.devices = "Please select at least one device you'll teach from";
      if (!internetSpeed) stepErrors.internetSpeed = "Please select your internet speed";
      if (toolProficiency.length === 0) stepErrors.toolProficiency = "Please add at least one tool you're comfortable using";

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
  }, [devices, internetSpeed, toolProficiency, hasQuietEnvironment, hasPeripherals, onNext]);

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
              {Object.values(TutorDeviceType).map((device) => (
                <label key={device} className="flex items-center space-x-2 text-sm">
                  <Checkbox checked={devices.includes(device)} onCheckedChange={() => toggleDevice(device)} />
                  <span>{DEVICE_LABELS[device]}</span>
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
    </div>
  );
}
