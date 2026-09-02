// The real, durable identity of one physical child - see stcbe's IChild.
// Separate from Student (types/student.ts), which represents one specific
// service enrollment for that child.
export interface Child {
  id: string;
  parentUser?: string;
  studentUser?: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: string;
  countryOfResidence?: string;
  phone?: string;
  primaryLanguage?: string;
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  parentOccupation?: string;
  grade?: string;
  admissionDate?: string;
  photoUrl?: string;
  studentIdCode?: string;
  nationality?: string;
  nin?: string;
  weightKg?: number;
  heightCm?: number;
  bloodGroup?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type UpdateChildProfileInput = Partial<
  Omit<Child, "id" | "parentUser" | "studentUser" | "createdAt" | "updatedAt">
>;
