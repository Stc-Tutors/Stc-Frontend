import { cookies } from "next/headers";

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
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    const headers = new Headers(request.headers || {});
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const res = await fetch(`${baseUrl}${url}`, { ...request, headers });

    // console.log("The response error is ", req)
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Unauthorized');
      }
      const data = await res.json();
      throw new Error(data.message)
    }

    return [res, null];
  } catch (error) {
    // if ((error as Error).message === 'Unauthorized') {
    //   redirect(ROUTES.AUTH.LOGIN);
    // }
    return [null, (error as Error).message];
  }
}
