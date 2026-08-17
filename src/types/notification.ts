export enum NotificationType {
  ASSIGNMENT_GRADED = "ASSIGNMENT_GRADED",
  NEW_SUBMISSION = "NEW_SUBMISSION",
  NEW_MESSAGE = "NEW_MESSAGE",
  CLASS_REMINDER = "CLASS_REMINDER",
  ENROLLMENT_STATUS = "ENROLLMENT_STATUS",
  ANNOUNCEMENT = "ANNOUNCEMENT",
  PAYOUT_STATUS = "PAYOUT_STATUS",
  REFERRAL_STATUS = "REFERRAL_STATUS",
  CLASS_CONFIRMED = "CLASS_CONFIRMED",
}

export interface Notification {
  id: string;
  user: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: string;
}
