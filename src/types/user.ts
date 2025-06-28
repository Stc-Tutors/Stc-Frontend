export enum UserRole {
  ADMIN = "ADMIN",
  TUTOR = "TUTOR",
  STUDENT = "STUDENT",
  PARENT = "PARENT",
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  profilePicture?: string;
  joinedDate: string;
}

export interface UserLogin {
  token: string;
  expiresAt: string;
  user: User;
}

export interface IUserLogin {
  email: string;
  role: UserRole;
  password: string;
}

export interface IUserSignup {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  password: string;
}