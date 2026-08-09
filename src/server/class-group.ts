"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { CreateClassGroupDto, IClassGroup, UpdateClassGroupDto } from "@/types/service-catalog";

// Task 3/5 - open/joinable cohorts for a Course Module (Path C) service that
// has flowRequirements.requires_cohort set, so the student can pick one
// directly instead of going through the one-on-one/group-class step.
// Public/unauthenticated on the backend.
export async function GetClassGroupsAction(params: {
  serviceType: string;
  course?: string;
  ageRange?: string;
}): Promise<[ApiResponse<IClassGroup[]> | null, string | null]> {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => !!v) as [string, string][]
  ).toString();

  const [res, error] = await fetchAPI({
    url: `/public/class-groups?${query}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<IClassGroup[]>) : null;
  return [resData, error];
}

// Everything below is ADMIN (MANAGE_TAXONOMY permission)/SUPER_ADMIN only -
// powers lms-home/admin/class-groups. Omit serviceType to get every class
// group across all services; pass it to scope to one service.
export async function GetAdminClassGroupsAction(
  serviceType?: string
): Promise<[ApiResponse<IClassGroup[]> | null, string | null]> {
  const qs = serviceType ? `?serviceType=${encodeURIComponent(serviceType)}` : "";
  const [res, error] = await fetchAPI({
    url: `/admin/class-groups${qs}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<IClassGroup[]>) : null;
  return [resData, error];
}

export async function CreateClassGroupAction(
  data: CreateClassGroupDto
): Promise<[ApiResponse<IClassGroup> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/admin/class-groups",
    request: { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) },
  });

  const resData = res ? ((await res.json()) as ApiResponse<IClassGroup>) : null;
  return [resData, error];
}

export async function UpdateClassGroupAction(
  id: string,
  data: UpdateClassGroupDto
): Promise<[ApiResponse<IClassGroup> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/admin/class-groups/${id}`,
    request: { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) },
  });

  const resData = res ? ((await res.json()) as ApiResponse<IClassGroup>) : null;
  return [resData, error];
}

export async function DeleteClassGroupAction(id: string): Promise<[ApiResponse<null> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/admin/class-groups/${id}`,
    request: { method: "DELETE", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<null>) : null;
  return [resData, error];
}
