export enum AnnouncementAudience {
  ALL = "ALL",
  STUDENTS = "STUDENTS",
  PARENTS = "PARENTS",
  TUTORS = "TUTORS",
  // Set when the sender picked an explicit recipient list instead of a
  // broad category - see SendAnnouncementPayload.
  CUSTOM = "CUSTOM",
  // An HOD's broadcast to the Tutors/Admins in their own HOD scope - see
  // BroadcastHodMessageAction.
  HOD_SCOPE = "HOD_SCOPE",
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  audience: AnnouncementAudience;
  link?: string;
  sentBy: string;
  recipientCount: number;
  recipientIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SendAnnouncementPayload {
  title: string;
  body: string;
  // Either audience or recipientIds is required - see AnnouncementService.send.
  audience?: AnnouncementAudience;
  recipientIds?: string[];
  link?: string;
}
