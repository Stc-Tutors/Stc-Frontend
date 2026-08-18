"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { CreateServiceDto, IService, ServiceCatalogStatus, UpdateServiceDto } from "@/types/service-catalog";

// Powers the Service Selection step (Task 1) - the DB-backed replacement for
// the hardcoded SERVICE_TYPE_LABELS list. Public/unauthenticated on the
// backend; defaults to Active-only there, but we pass it explicitly so the
// intent is visible here too.
export async function GetServicesAction(
  status: ServiceCatalogStatus = ServiceCatalogStatus.ACTIVE
): Promise<[ApiResponse<IService[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/public/services?status=${status}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<IService[]>) : null;
  return [resData, error];
}

// Single-service lookup by slug, NOT status-filtered (unlike
// GetServicesAction) - the /services/:slug marketing page needs to tell "this
// service doesn't exist" (404) apart from "it exists but isn't Active yet"
// (render a Coming Soon page instead).
export async function GetServiceBySlugAction(slug: string): Promise<[ApiResponse<IService> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/public/services/${slug}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<IService>) : null;
  return [resData, error];
}

// Everything below is ADMIN (MANAGE_TAXONOMY permission)/SUPER_ADMIN only -
// powers lms-home/admin/service-catalog. Unlike GetServicesAction above,
// this includes every status (Planned/Archived too), which the management
// screen needs to see.
export async function GetAdminServicesAction(
  status?: ServiceCatalogStatus | ""
): Promise<[ApiResponse<IService[]> | null, string | null]> {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  const [res, error] = await fetchAPI({
    url: `/admin/services${qs}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<IService[]>) : null;
  return [resData, error];
}

// There's no GET /admin/services/:id on the backend - the admin list
// endpoint (unfiltered, every status) is the only way to look up a single
// service. Thin client-side filter, consistent with how this file already
// treats /admin/services as the single source of truth. Used by the
// per-service workspace.
export async function GetServiceByIdAction(id: string): Promise<[ApiResponse<IService> | null, string | null]> {
  const [res, error] = await GetAdminServicesAction();
  if (error) return [null, error];
  const service = res?.data?.find((s) => s.id === id);
  if (!service) return [null, "Service not found"];
  return [{ success: true, message: res?.message ?? "", data: service }, null];
}

export async function CreateServiceAction(
  data: CreateServiceDto
): Promise<[ApiResponse<IService> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/admin/services",
    request: { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) },
  });

  const resData = res ? ((await res.json()) as ApiResponse<IService>) : null;
  return [resData, error];
}

export async function UpdateServiceAction(
  id: string,
  data: UpdateServiceDto
): Promise<[ApiResponse<IService> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/admin/services/${id}`,
    request: { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) },
  });

  const resData = res ? ((await res.json()) as ApiResponse<IService>) : null;
  return [resData, error];
}

export async function DeleteServiceAction(id: string): Promise<[ApiResponse<null> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/admin/services/${id}`,
    request: { method: "DELETE", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<null>) : null;
  return [resData, error];
}

// Accepts either { services: [...] } or a bare array - forwarded verbatim,
// the backend normalizes both the DTO shape and the raw snake_case source
// JSON shape (service_id/service_name/architectural_path/flow_requirements,
// no slug) server-side.
export async function BatchUploadServicesAction(
  payload: unknown
): Promise<[ApiResponse<IService[]> | null, string | null]> {
  const body = Array.isArray(payload) ? { services: payload } : payload;
  const [res, error] = await fetchAPI({
    url: "/admin/services/batch-upload",
    request: { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
  });

  const resData = res ? ((await res.json()) as ApiResponse<IService[]>) : null;
  return [resData, error];
}
