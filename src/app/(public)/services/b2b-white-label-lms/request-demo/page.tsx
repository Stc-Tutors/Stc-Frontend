"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import DynamicQuestionField, { CustomFieldValue } from "@/components/forms/dynamic-question-field";
import { useCustomFormFields } from "@/hooks/use-custom-form-fields";
import { CreateTenantInquiryAction } from "@/server/tenant-inquiry";

const STAGE = "tenant-inquiry:demo-request" as const;

// Lead-capture form for the B2B/White-Label LMS page - distinct from the
// individual-student registration flow, since this is a sales conversation
// (organization info, reviewed by the platform owner) rather than a
// self-enroll signup. Extra questions here are admin-configurable via the
// same custom-form-fields system the enrollment/tutor-onboarding wizards
// use (add/edit/remove under stage "tenant-inquiry:demo-request"), not
// hardcoded.
export default function RequestDemoPage() {
  const { fields: customFields } = useCustomFormFields(STAGE);

  const [organizationName, setOrganizationName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactRole, setContactRole] = useState("");
  const [message, setMessage] = useState("");
  const [customFieldResponses, setCustomFieldResponses] = useState<Record<string, CustomFieldValue>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleCustomFieldChange = (fieldId: string, value: CustomFieldValue) => {
    setCustomFieldResponses((prev) => ({ ...prev, [fieldId]: value }));
    setErrors((prev) => ({ ...prev, [`custom_${fieldId}`]: "" }));
  };

  const validate = (): Record<string, string> => {
    const next: Record<string, string> = {};
    if (!organizationName.trim()) next.organizationName = "Organization name is required";
    if (!contactName.trim()) next.contactName = "Your name is required";
    if (!contactEmail.trim() || !/\S+@\S+\.\S+/.test(contactEmail)) next.contactEmail = "A valid email is required";
    for (const field of customFields) {
      if (!field.required) continue;
      const value = customFieldResponses[field.id];
      const isEmpty = value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
      if (isEmpty) next[`custom_${field.id}`] = `${field.label} is required`;
    }
    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    const [, error] = await CreateTenantInquiryAction({
      organizationName: organizationName.trim(),
      contactName: contactName.trim(),
      contactEmail: contactEmail.trim(),
      contactRole: contactRole.trim() || undefined,
      message: message.trim() || undefined,
      customFieldResponses: Object.fromEntries(
        Object.entries(customFieldResponses).filter(([, v]) => v !== undefined)
      ) as Record<string, string | string[] | number | boolean>,
    });
    setIsSubmitting(false);

    if (error) {
      setSubmitError(error);
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="container mx-auto px-6 py-20 max-w-xl text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Thanks — we've got it.</h1>
        <p className="text-gray-600 mb-8">
          Someone from our team will reach out to {contactEmail} to schedule your demo.
        </p>
        <Link href="/services/b2b-white-label-lms" className="text-blue-600 hover:underline">
          ← Back to White-Label LMS
        </Link>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-6 py-16 max-w-xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Request a Demo</h1>
      <p className="text-gray-600 mb-8">
        Tell us about your organization and we'll be in touch to schedule a walkthrough of the White-Label LMS.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="organizationName">Organization name *</Label>
          <Input
            id="organizationName"
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            className={errors.organizationName ? "border-red-500" : ""}
          />
          {errors.organizationName && <p className="text-red-600 text-sm">{errors.organizationName}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactName">Your name *</Label>
          <Input
            id="contactName"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            className={errors.contactName ? "border-red-500" : ""}
          />
          {errors.contactName && <p className="text-red-600 text-sm">{errors.contactName}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactEmail">Email *</Label>
          <Input
            id="contactEmail"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className={errors.contactEmail ? "border-red-500" : ""}
          />
          {errors.contactEmail && <p className="text-red-600 text-sm">{errors.contactEmail}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactRole">Your role (optional)</Label>
          <Input
            id="contactRole"
            placeholder="e.g. Head of Programs, Founder, IT Director"
            value={contactRole}
            onChange={(e) => setContactRole(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">What are you looking for? (optional)</Label>
          <Textarea
            id="message"
            rows={4}
            placeholder="Tell us about your organization and what you'd like the platform to do for you."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        {customFields.map((field) => (
          <DynamicQuestionField
            key={field.id}
            field={field}
            value={customFieldResponses[field.id]}
            onChange={(value) => handleCustomFieldChange(field.id, value)}
            error={errors[`custom_${field.id}`]}
          />
        ))}

        {submitError && <p className="text-red-600 text-sm">{submitError}</p>}

        <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700">
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </Button>
      </form>
    </main>
  );
}
