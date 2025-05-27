import { ROUTES } from "@/config/routes";
import { redirect } from "next/navigation";

interface FetchApiTypes {
  baseUrl?: string;
  url: string;
  request: RequestInit
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export default async function fetchAPI<T>({
  baseUrl = process.env.NEXT_PUBLIC_API_URL,
  url,
  request,
}: FetchApiTypes): Promise<[Response | null, null | string]> {
  try {
    const res = await fetch(`${baseUrl}${url}`, request);

    // console.log("The response error is ", req)
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message)
    }

    return [res, null];


  } catch (error) {
    if((error as Error).message === 'Unauthorized') {
      redirect(ROUTES.AUTH.LOGIN);
    }
    return [null, (error as Error).message];
  }
}
