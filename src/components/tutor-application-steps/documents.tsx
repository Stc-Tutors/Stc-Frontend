"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FileUploadField from "@/components/ui/custom/file-upload-field";
import { useTutorApplication } from "@/contexts/tutor-application-context";
import {
  CertificationProof,
  TEACHING_CERTIFICATION_NONE,
  TutorApplicationStep4Payload,
} from "@/types/tutor-application";
import { UploadedFile } from "@/lib/cloudinary-upload";
import {
  CERTIFICATION_PROOF_UPLOAD_LIMITS,
  CV_UPLOAD_LIMITS,
  GOV_ID_UPLOAD_LIMITS,
  SUPPORTING_DOCUMENTS_UPLOAD_LIMITS,
} from "@/constants/upload-limits";

interface StepProps {
  onNext: (errors: Record<string, string>, data?: TutorApplicationStep4Payload) => void;
  errors: Record<string, string>;
}

export default function DocumentsStep({ onNext, errors }: StepProps) {
  const { draft } = useTutorApplication();

  const [govIdFile, setGovIdFile] = useState<UploadedFile | undefined>(draft.step4.govIdFile);
  const [cvFile, setCvFile] = useState<UploadedFile | undefined>(draft.step4.cvFile);
  const [supportingDocumentsFile, setSupportingDocumentsFile] = useState<UploadedFile | undefined>(
    draft.step4.supportingDocumentsFile
  );
  const [backgroundCheckConsent, setBackgroundCheckConsent] = useState(draft.step4.backgroundCheckConsent ?? false);
  const [reference1Name, setReference1Name] = useState(draft.step4.reference1Name || "");
  const [reference1Relationship, setReference1Relationship] = useState(draft.step4.reference1Relationship || "");
  const [reference1Contact, setReference1Contact] = useState(draft.step4.reference1Contact || "");
  const [reference1ConsentToContact, setReference1ConsentToContact] = useState(
    draft.step4.reference1ConsentToContact ?? false
  );
  const [reference2Name, setReference2Name] = useState(draft.step4.reference2Name || "");
  const [reference2Relationship, setReference2Relationship] = useState(draft.step4.reference2Relationship || "");
  const [reference2Contact, setReference2Contact] = useState(draft.step4.reference2Contact || "");
  const [reference2ConsentToContact, setReference2ConsentToContact] = useState(
    draft.step4.reference2ConsentToContact ?? false
  );

  // One proof-upload slot per certification checked in step 2's
  // otherCertifications (excluding "None") - not a single generic catch-all.
  // See _meta.extractionCaveats in tutor-registration-schema.json.
  const certificationsNeedingProof = (draft.step2.otherCertifications || []).filter(
    (c) => c !== TEACHING_CERTIFICATION_NONE
  );
  const [certificationProofs, setCertificationProofs] = useState<Partial<Record<string, UploadedFile>>>(() => {
    const initial: Partial<Record<string, UploadedFile>> = {};
    for (const proof of draft.step4.certificationProofs || []) {
      initial[proof.certification] = proof.file;
    }
    return initial;
  });

  useEffect(() => {
    const handleValidation = () => {
      const stepErrors: Record<string, string> = {};

      if (!govIdFile) stepErrors.govIdFile = "Please upload a government-issued ID";
      if (!cvFile) stepErrors.cvFile = "Please upload your CV/Resume";
      if (!backgroundCheckConsent) {
        stepErrors.backgroundCheckConsent = "Background/reference check consent is required";
      }
      if (!reference1Name.trim()) stepErrors.reference1Name = "Reference name is required";
      if (!reference1Relationship.trim()) stepErrors.reference1Relationship = "Please describe your relationship to this reference";
      if (!reference1Contact.trim()) stepErrors.reference1Contact = "Reference contact is required";
      if (!reference1ConsentToContact) {
        stepErrors.reference1ConsentToContact = "Please confirm this reference has agreed to be contacted";
      }
      if (!reference2Name.trim()) stepErrors.reference2Name = "Reference name is required";
      if (!reference2Relationship.trim()) stepErrors.reference2Relationship = "Please describe your relationship to this reference";
      if (!reference2Contact.trim()) stepErrors.reference2Contact = "Reference contact is required";
      if (!reference2ConsentToContact) {
        stepErrors.reference2ConsentToContact = "Please confirm this reference has agreed to be contacted";
      }
      for (const cert of certificationsNeedingProof) {
        if (!certificationProofs[cert]) {
          stepErrors[`certProof_${cert}`] = `Please upload proof of ${cert}`;
        }
      }

      if (Object.keys(stepErrors).length === 0 && govIdFile && cvFile) {
        const proofs: CertificationProof[] = certificationsNeedingProof.map((cert) => ({
          certification: cert,
          file: certificationProofs[cert]!,
        }));
        onNext(stepErrors, {
          govIdFile,
          cvFile,
          supportingDocumentsFile,
          certificationProofs: proofs.length > 0 ? proofs : undefined,
          backgroundCheckConsent,
          reference1Name,
          reference1Relationship,
          reference1Contact,
          reference1ConsentToContact,
          reference2Name,
          reference2Relationship,
          reference2Contact,
          reference2ConsentToContact,
        });
      } else {
        onNext(stepErrors);
      }
    };

    window.addEventListener("validateStep", handleValidation);
    return () => window.removeEventListener("validateStep", handleValidation);
  }, [
    govIdFile,
    cvFile,
    supportingDocumentsFile,
    backgroundCheckConsent,
    reference1Name,
    reference1Relationship,
    reference1Contact,
    reference1ConsentToContact,
    reference2Name,
    reference2Relationship,
    reference2Contact,
    reference2ConsentToContact,
    certificationProofs,
    onNext,
  ]);

  return (
    <div className="space-y-6 w-full">
      <Card>
        <CardHeader>
          <CardTitle>Identity & CV</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Government-issued ID *</Label>
            <FileUploadField
              id="govIdUpload"
              folder="tutor-applications/gov-id"
              limits={GOV_ID_UPLOAD_LIMITS}
              value={govIdFile}
              onChange={setGovIdFile}
              error={errors.govIdFile}
            />
          </div>
          <div className="space-y-2">
            <Label>CV/Resume *</Label>
            <FileUploadField
              id="cvUpload"
              folder="tutor-applications/cv"
              limits={CV_UPLOAD_LIMITS}
              value={cvFile}
              onChange={setCvFile}
              error={errors.cvFile}
            />
          </div>
          <div className="space-y-2">
            <Label>Additional Certificates/Supporting Documents (optional)</Label>
            <FileUploadField
              id="supportingDocumentsUpload"
              folder="tutor-applications/supporting-documents"
              limits={SUPPORTING_DOCUMENTS_UPLOAD_LIMITS}
              value={supportingDocumentsFile}
              onChange={setSupportingDocumentsFile}
            />
          </div>
        </CardContent>
      </Card>

      {certificationsNeedingProof.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Certification Proof</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {certificationsNeedingProof.map((cert) => (
              <div key={cert} className="space-y-2">
                <Label>Upload proof of {cert} *</Label>
                <FileUploadField
                  id={`certProof_${cert}`}
                  folder="tutor-applications/cert-proof"
                  limits={CERTIFICATION_PROOF_UPLOAD_LIMITS}
                  value={certificationProofs[cert]}
                  onChange={(file) => setCertificationProofs((prev) => ({ ...prev, [cert]: file }))}
                  error={errors[`certProof_${cert}`]}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Safeguarding & References</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-start space-x-2">
            <Checkbox checked={backgroundCheckConsent} onCheckedChange={(c) => setBackgroundCheckConsent(c as boolean)} />
            <span className="text-sm">
              I consent to a background/reference check as part of onboarding, given this platform works with minors *
            </span>
          </label>
          {errors.backgroundCheckConsent && <p className="text-red-600 text-sm">{errors.backgroundCheckConsent}</p>}

          <div className="space-y-3 border-t pt-4">
            <h4 className="text-sm font-semibold">Reference 1 *</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reference1Name">Name *</Label>
                <Input
                  id="reference1Name"
                  value={reference1Name}
                  onChange={(e) => setReference1Name(e.target.value)}
                  className={errors.reference1Name ? "border-red-500" : ""}
                />
                {errors.reference1Name && <p className="text-red-600 text-sm">{errors.reference1Name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference1Relationship">Relationship to you *</Label>
                <Input
                  id="reference1Relationship"
                  placeholder="e.g. Former Head of Department"
                  value={reference1Relationship}
                  onChange={(e) => setReference1Relationship(e.target.value)}
                  className={errors.reference1Relationship ? "border-red-500" : ""}
                />
                {errors.reference1Relationship && (
                  <p className="text-red-600 text-sm">{errors.reference1Relationship}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference1Contact">Email *</Label>
              <Input
                id="reference1Contact"
                type="email"
                value={reference1Contact}
                onChange={(e) => setReference1Contact(e.target.value)}
                className={errors.reference1Contact ? "border-red-500" : ""}
              />
              {errors.reference1Contact && <p className="text-red-600 text-sm">{errors.reference1Contact}</p>}
            </div>
            <label className="flex items-start space-x-2">
              <Checkbox
                checked={reference1ConsentToContact}
                onCheckedChange={(c) => setReference1ConsentToContact(c as boolean)}
              />
              <span className="text-sm">This reference has agreed that STC Tutors may contact them *</span>
            </label>
            {errors.reference1ConsentToContact && (
              <p className="text-red-600 text-sm">{errors.reference1ConsentToContact}</p>
            )}
          </div>

          <div className="space-y-3 border-t pt-4">
            <h4 className="text-sm font-semibold">Reference 2 *</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reference2Name">Name *</Label>
                <Input
                  id="reference2Name"
                  value={reference2Name}
                  onChange={(e) => setReference2Name(e.target.value)}
                  className={errors.reference2Name ? "border-red-500" : ""}
                />
                {errors.reference2Name && <p className="text-red-600 text-sm">{errors.reference2Name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference2Relationship">Relationship to you *</Label>
                <Input
                  id="reference2Relationship"
                  placeholder="e.g. Former Head of Department"
                  value={reference2Relationship}
                  onChange={(e) => setReference2Relationship(e.target.value)}
                  className={errors.reference2Relationship ? "border-red-500" : ""}
                />
                {errors.reference2Relationship && (
                  <p className="text-red-600 text-sm">{errors.reference2Relationship}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference2Contact">Email *</Label>
              <Input
                id="reference2Contact"
                type="email"
                value={reference2Contact}
                onChange={(e) => setReference2Contact(e.target.value)}
                className={errors.reference2Contact ? "border-red-500" : ""}
              />
              {errors.reference2Contact && <p className="text-red-600 text-sm">{errors.reference2Contact}</p>}
            </div>
            <label className="flex items-start space-x-2">
              <Checkbox
                checked={reference2ConsentToContact}
                onCheckedChange={(c) => setReference2ConsentToContact(c as boolean)}
              />
              <span className="text-sm">This reference has agreed that STC Tutors may contact them *</span>
            </label>
            {errors.reference2ConsentToContact && (
              <p className="text-red-600 text-sm">{errors.reference2ConsentToContact}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
