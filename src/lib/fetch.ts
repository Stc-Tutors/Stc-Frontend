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

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

    const res = await fetch(`${baseUrl}${url}`, {
       ...request, 
       headers,
        signal: controller.signal,
       });

    clearTimeout(timeout);


    // console.log("The response error is ", req)
    if (!res.ok) {
      let errorMessage = 'Request failed';
      try {
        const data = await res.json();
        errorMessage = data.message || errorMessage;
      } catch {
        errorMessage = res.statusText || errorMessage;
      }

      if (res.status === 401) {
        throw new Error('Unauthorized');
      }

      throw new Error(errorMessage)
    }

    return [res, null];
  } catch (error) {
    // if ((error as Error).message === 'Unauthorized') {
    //   redirect(ROUTES.AUTH.LOGIN);
    // }
    let message = 'Something went wrong';
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        message = 'Request timed out';
      } else {
        message = error.message;
      }
    } 
    return [null, (error as Error).message];
  }
}
