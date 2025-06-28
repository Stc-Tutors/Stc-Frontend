"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { Payment, PaymentRequest } from "@/types/payment";

export async function InitiatePaymentAction(data: any
): Promise<[ApiResponse<PaymentRequest> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/users/me",
    request: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...data }),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<PaymentRequest>) : null;

  return [resData, error];
}


export async function GetPaymentsAction(): Promise<[ApiResponse<Payment[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/payments",
    request: {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Payment[]>) : null;
// console.log("The response data is ", resData, error); 
  return [resData, error];
}

