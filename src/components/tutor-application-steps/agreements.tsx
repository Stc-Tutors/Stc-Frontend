"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTutorApplication } from "@/contexts/tutor-application-context";
import { TutorApplicationStep10Payload, WhatsappChannelStatus } from "@/types/tutor-application";

interface StepProps {
  onNext: (errors: Record<string, string>, data?: TutorApplicationStep10Payload) => void;
  errors: Record<string, string>;
}

export default function AgreementsStep({ onNext, errors }: StepProps) {
  const { draft } = useTutorApplication();

  const [termsAccepted, setTermsAccepted] = useState(draft.step10.termsAccepted ?? false);
  const [ethicsCommitmentAccepted, setEthicsCommitmentAccepted] = useState(draft.step10.ethicsCommitmentAccepted ?? false);
  const [dataPrivacyAgreed, setDataPrivacyAgreed] = useState(draft.step10.dataPrivacyAgreed ?? false);
  const [signature, setSignature] = useState(draft.step10.signature || "");
  const [whatsappChannelJoined, setWhatsappChannelJoined] = useState<WhatsappChannelStatus | "">(
    draft.step10.whatsappChannelJoined || ""
  );

  useEffect(() => {
    const handleValidation = () => {
      const stepErrors: Record<string, string> = {};

      if (!termsAccepted) stepErrors.termsAccepted = "You must agree to the platform terms and conditions";
      if (!ethicsCommitmentAccepted) {
        stepErrors.ethicsCommitmentAccepted = "You must commit to maintaining a professional and ethical standard";
      }
      if (!dataPrivacyAgreed) stepErrors.dataPrivacyAgreed = "You must consent to how your personal data is processed";
      if (signature.trim().length < 2) stepErrors.signature = "Please type your full name as your signature";
      if (!whatsappChannelJoined) stepErrors.whatsappChannelJoined = "Please select an option";

      if (Object.keys(stepErrors).length === 0) {
        onNext(stepErrors, {
          termsAccepted,
          ethicsCommitmentAccepted,
          dataPrivacyAgreed,
          signature,
          whatsappChannelJoined: whatsappChannelJoined as WhatsappChannelStatus,
        });
      } else {
        onNext(stepErrors);
      }
    };

    window.addEventListener("validateStep", handleValidation);
    return () => window.removeEventListener("validateStep", handleValidation);
  }, [termsAccepted, ethicsCommitmentAccepted, dataPrivacyAgreed, signature, whatsappChannelJoined, onNext]);

  return (
    <div className="space-y-6 w-full">
      <Card>
        <CardHeader>
          <CardTitle>Agreements & Consent</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-start space-x-2">
            <Checkbox checked={termsAccepted} onCheckedChange={(c) => setTermsAccepted(c as boolean)} />
            <span className="text-sm">I have read and agree to STC Tutors&apos; Code of Conduct *</span>
          </label>
          {errors.termsAccepted && <p className="text-red-600 text-sm">{errors.termsAccepted}</p>}

          <label className="flex items-start space-x-2">
            <Checkbox checked={ethicsCommitmentAccepted} onCheckedChange={(c) => setEthicsCommitmentAccepted(c as boolean)} />
            <span className="text-sm">
              I understand and agree to the payment structure (revenue-share rate, withdrawal schedule, referral
              bonus terms) *
            </span>
          </label>
          {errors.ethicsCommitmentAccepted && <p className="text-red-600 text-sm">{errors.ethicsCommitmentAccepted}</p>}

          <label className="flex items-start space-x-2">
            <Checkbox checked={dataPrivacyAgreed} onCheckedChange={(c) => setDataPrivacyAgreed(c as boolean)} />
            <span className="text-sm">
              I consent to STC Tutors processing my personal data as described in the Privacy Policy *
            </span>
          </label>
          {errors.dataPrivacyAgreed && <p className="text-red-600 text-sm">{errors.dataPrivacyAgreed}</p>}

          <div className="space-y-2">
            <Label htmlFor="signature">Type your full name as your e-signature *</Label>
            <Input
              id="signature"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              className={errors.signature ? "border-red-500" : ""}
            />
            {errors.signature && <p className="text-red-600 text-sm">{errors.signature}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsappChannelJoined">
              Upon completion of this form, please join the tutors&apos; WhatsApp channel *
            </Label>
            <Select value={whatsappChannelJoined} onValueChange={(v) => setWhatsappChannelJoined(v as WhatsappChannelStatus)}>
              <SelectTrigger id="whatsappChannelJoined" className={errors.whatsappChannelJoined ? "border-red-500" : ""}>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={WhatsappChannelStatus.JOINED}>Joined</SelectItem>
                <SelectItem value={WhatsappChannelStatus.YET_TO_JOIN}>Yet to join</SelectItem>
              </SelectContent>
            </Select>
            {errors.whatsappChannelJoined && <p className="text-red-600 text-sm">{errors.whatsappChannelJoined}</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
