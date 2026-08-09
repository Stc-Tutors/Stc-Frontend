"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import {
  CreateCustomFormFieldDto,
  CustomFormStage,
  ICustomFormField,
  UpdateCustomFormFieldDto,
} from "@/types/service-catalog";

// Task 6 - dynamic per-stage/per-service signup questions rendered by
// DynamicQuestionField. Public/unauthenticated, active-only on the backend.
// `serviceType` (IService.slug) is optional and narrows to that service's
// fields plus service-agnostic ones.
export async function GetCustomFormFieldsAction(
  stage: CustomFormStage,
  serviceType?: string
): Promise<[ApiResponse<ICustomFormField[]> | null, string | null]> {
  const params = new URLSearchParams({ stage });
  if (serviceType) params.set("serviceType", serviceType);

  const [res, error] = await fetchAPI({
    url: `/public/custom-form-fields?${params.toString()}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<ICustomFormField[]>) : null;
  return [resData, error];
}

// Everything below is ADMIN (MANAGE_TAXONOMY permission)/SUPER_ADMIN only -
// powers lms-home/admin/custom-form-fields. Omit serviceType to get every
// field across all services and stages (used by the admin builder); pass it
// to scope to one service's fields plus the service-agnostic ones.
export async function GetAdminCustomFormFieldsAction(
  serviceType?: string
): Promise<[ApiResponse<ICustomFormField[]> | null, string | null]> {
  const qs = serviceType ? `?serviceType=${encodeURIComponent(serviceType)}` : "";
  const [res, error] = await fetchAPI({
    url: `/admin/custom-form-fields${qs}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<ICustomFormField[]>) : null;
  return [resData, error];
}

export async function CreateCustomFormFieldAction(
  data: CreateCustomFormFieldDto
): Promise<[ApiResponse<ICustomFormField> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/admin/custom-form-fields",
    request: { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) },
  });

  const resData = res ? ((await res.json()) as ApiResponse<ICustomFormField>) : null;
  return [resData, error];
}

export async function UpdateCustomFormFieldAction(
  id: string,
  data: UpdateCustomFormFieldDto
): Promise<[ApiResponse<ICustomFormField> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/admin/custom-form-fields/${id}`,
    request: { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) },
  });

  const resData = res ? ((await res.json()) as ApiResponse<ICustomFormField>) : null;
  return [resData, error];
}

export async function DeleteCustomFormFieldAction(id: string): Promise<[ApiResponse<null> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/admin/custom-form-fields/${id}`,
    request: { method: "DELETE", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<null>) : null;
  return [resData, error];
}
