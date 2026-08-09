"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import {
  BatchTaxonomyOption,
  CreateTaxonomyOptionDto,
  ITaxonomyOption,
  TaxonomyOptionKind,
  UpdateTaxonomyOptionDto,
} from "@/types/service-catalog";

// Backs every Country-of-residence/Primary-language/Age-range dropdown across
// the enrollment flow (Task 1/2/3) - the DB-backed replacement for the old
// world-countries-driven CountrySelect and the hardcoded `languages = ["English"]`
// list. Public/unauthenticated, active-only on the backend.
export async function GetTaxonomyOptionsAction(
  kind: TaxonomyOptionKind
): Promise<[ApiResponse<ITaxonomyOption[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/public/taxonomy-options?kind=${kind}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<ITaxonomyOption[]>) : null;
  return [resData, error];
}

// Everything below is ADMIN (MANAGE_TAXONOMY permission)/SUPER_ADMIN only -
// powers lms-home/admin/taxonomy-options. Unlike GetTaxonomyOptionsAction
// above, this includes inactive rows too, which the management screen needs
// to see (and toggle back on).
export async function GetAdminTaxonomyOptionsAction(
  kind: TaxonomyOptionKind,
  activeOnly?: boolean
): Promise<[ApiResponse<ITaxonomyOption[]> | null, string | null]> {
  const params = new URLSearchParams({ kind });
  if (activeOnly) params.set("activeOnly", "true");

  const [res, error] = await fetchAPI({
    url: `/admin/taxonomy-options?${params.toString()}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<ITaxonomyOption[]>) : null;
  return [resData, error];
}

export async function CreateTaxonomyOptionAction(
  data: CreateTaxonomyOptionDto
): Promise<[ApiResponse<ITaxonomyOption> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/admin/taxonomy-options",
    request: { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) },
  });

  const resData = res ? ((await res.json()) as ApiResponse<ITaxonomyOption>) : null;
  return [resData, error];
}

export async function BatchUploadTaxonomyOptionsAction(
  kind: TaxonomyOptionKind,
  options: BatchTaxonomyOption[]
): Promise<[ApiResponse<ITaxonomyOption[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/admin/taxonomy-options/batch-upload",
    request: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, options }),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<ITaxonomyOption[]>) : null;
  return [resData, error];
}

export async function UpdateTaxonomyOptionAction(
  id: string,
  data: UpdateTaxonomyOptionDto
): Promise<[ApiResponse<ITaxonomyOption> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/admin/taxonomy-options/${id}`,
    request: { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) },
  });

  const resData = res ? ((await res.json()) as ApiResponse<ITaxonomyOption>) : null;
  return [resData, error];
}

export async function DeleteTaxonomyOptionAction(id: string): Promise<[ApiResponse<null> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/admin/taxonomy-options/${id}`,
    request: { method: "DELETE", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<null>) : null;
  return [resData, error];
}
