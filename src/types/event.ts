export enum EventCategory {
  SESSION = "SESSION",
  MEETING = "MEETING",
  EXAM = "EXAM",
  DEADLINE = "DEADLINE",
  ACTIVITY = "ACTIVITY",
  OTHER = "OTHER",
}

export interface PlatformEvent {
  id: string;
  title: string;
  description?: string;
  category: EventCategory;
  startDate: string;
  endDate: string;
  location?: string;
  course?: string | { id: string; title?: string };
  tutor?: string | { id: string; firstName: string; lastName: string };
  studentIds?: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
