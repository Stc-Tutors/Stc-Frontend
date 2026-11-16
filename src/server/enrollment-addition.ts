"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";

// A subject/course an admin added to a running enrollment and asked the family to pay for.
export interface PendingAddition {
  id: string;
  student: string;
  studentName?: string;
  items: { subject: string; courseId?: string }[];
  amount: number;
  currency: string;
  createdAt: string;
}

export interface AdditionPayment {
  authorization_url: string;
  access_code: string;
  reference: string;
  fullyCoveredByWallet?: boolean;
}

export async function GetMyPendingAdditionsAction(): Promise<[ApiResponse<PendingAddition[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/enrollment-additions/mine",
    request: { method: "GET", headers: { "Content-Type": "application/json" } },
  });
  return [res ? ((await res.json()) as ApiResponse<PendingAddition[]>) : null, error];
}

// Starts the payment; the subject is added once it is verified.
export async function PayAdditionAction(id: string): Promise<[ApiResponse<AdditionPayment> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/enrollment-additions/${id}/pay`,
    request: { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" },
  });
  return [res ? ((await res.json()) as ApiResponse<AdditionPayment>) : null, error];
}
