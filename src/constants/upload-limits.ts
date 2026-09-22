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

// A profile picture (User.avatarUrl) - tighter than the 1MB default since it's
// loaded on every page/message row. Keep in sync with stcbe's
// MAX_AVATAR_SIZE_BYTES in core/utils/avatar-url-validation.ts, which
// re-checks the uploaded file's actual size when the URL is saved.
export const AVATAR_MAX_SIZE_KB = 500;
export const AVATAR_UPLOAD_LIMITS: UploadLimits = {
  allowedFormats: ["JPG", "JPEG", "PNG"],
  maxSizeMB: AVATAR_MAX_SIZE_KB / 1024,
};

// A tutor's assignment attachment (document, picture, video or audio) -
// deliberately above the 1MB default; capped at 5MB instead. Keep in sync
// with stcbe's ASSIGNMENT_ATTACHMENT_UPLOAD_LIMITS.
export const ASSIGNMENT_ATTACHMENT_UPLOAD_LIMITS: UploadLimits = {
  allowedFormats: ["PDF", "DOC", "DOCX", "JPG", "JPEG", "PNG", "MP4", "MOV", "MP3", "WAV", "M4A"],
  maxSizeMB: 5,
};
// A student's submitted work - same formats/size as an assignment's own
// attachment. Keep in sync with stcbe's SUBMISSION_ATTACHMENT_UPLOAD_LIMITS.
export const SUBMISSION_ATTACHMENT_UPLOAD_LIMITS: UploadLimits = ASSIGNMENT_ATTACHMENT_UPLOAD_LIMITS;

// A Careers page applicant's resume - same formats as a tutor CV, but sized
// like an assignment attachment rather than the tight 1MB default (a résumé
// with any formatting easily exceeds 1MB). Keep in sync with stcbe's
// FOLDER_FORMATS['careers/resumes'].
export const CAREER_RESUME_UPLOAD_LIMITS: UploadLimits = { allowedFormats: ["PDF", "DOC", "DOCX"], maxSizeMB: 5 };
