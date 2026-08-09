"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { Complaint, ComplaintCategory, ComplaintStatus, FileComplaintPayload } from "@/types/complaint";

export async function FileComplaintAction(
  data: FileComplaintPayload
): Promise<[ApiResponse<Complaint> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/complaints",
    request: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Complaint>) : null;
  return [resData, error];
}

export async function GetMyComplaintsAction(): Promise<[ApiResponse<Complaint[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/complaints/mine",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Complaint[]>) : null;
  return [resData, error];
}

export async function GetAllComplaintsAction(
  filters?: { status?: ComplaintStatus; category?: ComplaintCategory }
): Promise<[ApiResponse<Complaint[]> | null, string | null]> {
  const query = new URLSearchParams(
    Object.entries(filters ?? {}).filter(([, v]) => !!v) as [string, string][]
  ).toString();

  const [res, error] = await fetchAPI({
    url: `/complaints${query ? `?${query}` : ""}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Complaint[]>) : null;
  return [resData, error];
}

export async function GetComplaintAction(id: string): Promise<[ApiResponse<Complaint> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/complaints/${id}`,
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Complaint>) : null;
  return [resData, error];
}

export async function AssignComplaintAction(
  id: string,
  assigneeId: string
): Promise<[ApiResponse<Complaint> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/complaints/${id}/assign`,
    request: {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assigneeId }),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Complaint>) : null;
  return [resData, error];
}

export async function ResolveComplaintAction(
  id: string,
  status: ComplaintStatus.RESOLVED | ComplaintStatus.DISMISSED,
  resolutionNotes: string
): Promise<[ApiResponse<Complaint> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/complaints/${id}/resolve`,
    request: {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, resolutionNotes }),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Complaint>) : null;
  return [resData, error];
}
