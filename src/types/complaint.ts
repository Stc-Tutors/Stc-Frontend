export enum ComplaintCategory {
  PAYMENT = "PAYMENT",
  TUTOR_CONDUCT = "TUTOR_CONDUCT",
  STUDENT_CONDUCT = "STUDENT_CONDUCT",
  SESSION_QUALITY = "SESSION_QUALITY",
  TECHNICAL = "TECHNICAL",
  OTHER = "OTHER",
}

export enum ComplaintStatus {
  OPEN = "OPEN",
  INVESTIGATING = "INVESTIGATING",
  RESOLVED = "RESOLVED",
  DISMISSED = "DISMISSED",
}

// `complainant`/`respondent`/`assignedTo`/`resolvedBy` come back as plain user
// id strings from the backend (see IComplaint) - never populated.
export interface Complaint {
  id: string;
  complainant: string;
  respondent?: string;
  category: ComplaintCategory;
  subject: string;
  description: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  status: ComplaintStatus;
  assignedTo?: string;
  resolutionNotes?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FileComplaintPayload {
  category: ComplaintCategory;
  subject: string;
  description: string;
  respondentId?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}
