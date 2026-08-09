"use client";

// Task 6 - generic renderer for a single admin-defined ICustomFormField,
// switching on `fieldType`. Used at every enrollment wizard stage
// (service-selection/child-info/subjects-schedule/review) to render whatever
// extra questions a Super Admin has configured for that stage/service,
// without the frontend needing to know about them ahead of time.

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomFormFieldType, ICustomFormField } from "@/types/service-catalog";

export type CustomFieldValue = string | string[] | number | boolean | undefined;

interface DynamicQuestionFieldProps {
  field: ICustomFormField;
  value: CustomFieldValue;
  onChange: (value: CustomFieldValue) => void;
  error?: string;
}

export default function DynamicQuestionField({ field, value, onChange, error }: DynamicQuestionFieldProps) {
  const inputId = `custom-field-${field.id}`;

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>
        {field.label}
        {field.required && " *"}
      </Label>

      {field.fieldType === CustomFormFieldType.TEXT && (
        <Input
          id={inputId}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={error ? "border-red-500" : ""}
        />
      )}

      {field.fieldType === CustomFormFieldType.TEXTAREA && (
        <Textarea
          id={inputId}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={error ? "border-red-500" : ""}
        />
      )}

      {field.fieldType === CustomFormFieldType.NUMBER && (
        <Input
          id={inputId}
          type="number"
          value={value === undefined || value === null ? "" : String(value)}
          onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
          className={error ? "border-red-500" : ""}
        />
      )}

      {field.fieldType === CustomFormFieldType.DATE && (
        <Input
          id={inputId}
          type="date"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={error ? "border-red-500" : ""}
        />
      )}

      {field.fieldType === CustomFormFieldType.DROPDOWN && (
        <Select value={(value as string) ?? ""} onValueChange={(v) => onChange(v)}>
          <SelectTrigger id={inputId} className={error ? "border-red-500" : ""}>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {(field.options ?? []).map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {field.fieldType === CustomFormFieldType.CHECKBOX && (
        <div className="grid grid-cols-2 gap-2">
          {(field.options ?? []).map((option) => {
            const selected = Array.isArray(value) ? value.includes(option) : false;
            return (
              <label key={option} className="flex items-center space-x-2">
                <Checkbox
                  checked={selected}
                  onCheckedChange={(checked) => {
                    const current = Array.isArray(value) ? value : [];
                    onChange(checked ? [...current, option] : current.filter((v) => v !== option));
                  }}
                />
                <span className="text-sm">{option}</span>
              </label>
            );
          })}
        </div>
      )}

      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );
}
