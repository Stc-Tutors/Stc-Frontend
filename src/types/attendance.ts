export enum AttendanceStatus {
  PRESENT = "PRESENT",
  ABSENT = "ABSENT",
  LATE = "LATE",
  EXCUSED = "EXCUSED",
}

export interface Attendance {
  id: string;
  course: string | { id: string; title: string };
  lesson?: string;
  student: string;
  date: string;
  status: AttendanceStatus;
  markedBy: string;
  selfConfirmed?: boolean;
  notes?: string;
}
