export enum EnrollmentStatus {
  PENDING = 'PENDING',
  ENROLLED = 'ENROLLED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}


export interface ISchedule {
  subject: string;
  days: string[];
  time: string;
  duration: number;
}

export interface IServiceDetails {
  ageLevel: string;
  learningFocus: string;
  learningGoals: string;
  selectedSubjects: string[];
  serviceType: string;
  tutorGender: string;
  curriculum?: string;
  totalCost: number;
}

export interface Student {
  id: string;
  user: string;
  fullName: string;
  dateOfBirth: Date;
  gender: string;
  countryOfResidence: string;
  phone: string;
  primaryLanguage: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  serviceDetails: IServiceDetails;
  schedule: ISchedule[];
  enrollmentStatus: EnrollmentStatus;
}