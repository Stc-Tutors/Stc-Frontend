import { CustomFieldResponses } from "./service-catalog";

export enum TenantInquiryStatus {
  NEW = "NEW",
  REVIEWING = "REVIEWING",
  QUALIFIED = "QUALIFIED",
  DECLINED = "DECLINED",
  ONBOARDED = "ONBOARDED",
}

export interface ITenantInquiry {
  id: string;
  organizationName: string;
  contactName: string;
  contactEmail: string;
  contactRole?: string;
  message?: string;
  status: TenantInquiryStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  internalNotes?: string;
  customFieldResponses?: CustomFieldResponses;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantInquiryDto {
  organizationName: string;
  contactName: string;
  contactEmail: string;
  contactRole?: string;
  message?: string;
  customFieldResponses?: CustomFieldResponses;
}
