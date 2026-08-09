import { ISchedule } from "./student";

export enum ScheduleProposalStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  REJECTED = "REJECTED",
}

export interface ScheduleProposal {
  id: string;
  student: string;
  proposedSchedule: ISchedule[];
  createdBy: string;
  status: ScheduleProposalStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}
