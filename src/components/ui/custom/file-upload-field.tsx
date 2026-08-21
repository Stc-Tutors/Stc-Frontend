"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  uploadToCloudinary,
  validateFileBeforeUpload,
  UploadFolder,
  UploadedFile,
  UploadLimits,
} from "@/lib/cloudinary-upload";

interface Props {
  id: string;
  folder: UploadFolder;
  value?: UploadedFile;
  onChange: (file: UploadedFile) => void;
  // Shown as a hint and enforced client-side before the file ever uploads -
  // see tutor-registration-schema.json's per-field acceptedFormats/maxSizeMB.
  // The backend re-validates the same limits; this is UX only.
  limits: UploadLimits;
  error?: string;
}

// Shared upload widget for every tutor-application file_upload field
// (headshot, gov ID, CV, certification proofs, supporting documents) - see
// lib/cloudinary-upload.ts.
export default function FileUploadField({ id, folder, value, onChange, limits, error }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFileBeforeUpload(file, limits);
    if (validationError) {
      setUploadError(validationError);
      e.target.value = "";
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    try {
      const uploaded = await uploadToCloudinary(file, folder);
      onChange(uploaded);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const accept = limits.allowedFormats.map((f) => `.${f.toLowerCase()}`).join(",");

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <Button type="button" variant="outline" disabled={isUploading} asChild>
          <label htmlFor={id} className="cursor-pointer flex items-center gap-2">
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {isUploading ? "Uploading..." : value ? "Replace file" : "Choose file"}
          </label>
        </Button>
        {value && !isUploading && (
          <span className="flex items-center gap-1 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" /> {value.fileName}
          </span>
        )}
        <input id={id} type="file" accept={accept} onChange={handleFileChange} className="hidden" />
      </div>
      <p className="text-xs text-gray-400">
        {limits.allowedFormats.join(", ")} - up to {limits.maxSizeMB}MB
      </p>
      {uploadError && <p className="text-red-600 text-sm">{uploadError}</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );
}
