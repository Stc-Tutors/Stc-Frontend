import { UploadLimits } from "@/lib/cloudinary-upload";

// Mirrors stcbe's core/utils/upload-validation.ts. Formats are taken
// directly from tutor-registration-schema.json's "documents" step;
// maxSizeMB was tightened platform-wide to 1MB (confirmed 2026-08-21).
// Keep in sync with the backend copy if these change.
const MAX_UPLOAD_SIZE_MB = 1;

export const GOV_ID_UPLOAD_LIMITS: UploadLimits = { allowedFormats: ["PDF", "JPG", "PNG"], maxSizeMB: MAX_UPLOAD_SIZE_MB };
export const CV_UPLOAD_LIMITS: UploadLimits = { allowedFormats: ["PDF", "DOC", "DOCX"], maxSizeMB: MAX_UPLOAD_SIZE_MB };
export const HEADSHOT_UPLOAD_LIMITS: UploadLimits = { allowedFormats: ["JPG", "PNG"], maxSizeMB: MAX_UPLOAD_SIZE_MB };
export const SUPPORTING_DOCUMENTS_UPLOAD_LIMITS: UploadLimits = {
  allowedFormats: ["PDF", "DOC", "DOCX", "JPG", "PNG"],
  maxSizeMB: MAX_UPLOAD_SIZE_MB,
};
export const CERTIFICATION_PROOF_UPLOAD_LIMITS: UploadLimits = GOV_ID_UPLOAD_LIMITS;
