"use server";

import fetchAPI, { type ApiResponse } from "@/lib/fetch";
import { Student, } from "@/types/student";
import { PaymentRequest } from "@/types/payment";


export interface EnrollmentResponse {
  student: Student;
  payment: PaymentRequest;
}

export async function EnrollAction(
  data: any
): Promise<[ApiResponse<EnrollmentResponse> | null, string | null]> {
  console.log("The data is ", data);
  const [res, error] = await fetchAPI({
    url: "/enrollments",
    request: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<EnrollmentResponse>) : null;
  console.log("The response data is ", resData, error);
  console.log("The error data is ", error);

  return [resData, error];
}

export async function GetEnrollmentsAction(
): Promise<[ApiResponse<Student[]> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: "/enrollments",
    request: {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Student[] | []>) : null;

  return [resData, error];
}

export async function GetEnrollmentAction(id: string): Promise<[ApiResponse<Student> | null, string | null]> {
  const [res, error] = await fetchAPI({
    url: `/enrollments/${id}`,
    request: {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  });

  const resData = res ? ((await res.json()) as ApiResponse<Student>) : null;

  return [resData, error];
}