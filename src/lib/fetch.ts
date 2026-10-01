import { createHmac } from "crypto";
import { cookies, headers } from "next/headers";

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


// The API reports a failed field-level validation as { message: "Validation
// failed", details: [...] } - the message alone tells a user nothing, so fold the
// first few reasons in. Handles express-validator ({ msg }) and class-validator
// ({ property, constraints }) shapes.
function describeErrorDetails(details: unknown): string {
  if (!Array.isArray(details)) return "";
  const reasons = details
    .map((d: any) => {
      if (typeof d === "string") return d;
      if (d?.msg) return String(d.msg);
      if (d?.constraints) return Object.values(d.constraints as Record<string, string>).join(", ");
      return "";
    })
    .filter(Boolean);
  if (reasons.length === 0) return "";
  const shown = Array.from(new Set(reasons)).slice(0, 4).join("; ");
  return reasons.length > 4 ? shown + "; ..." : shown;
}

export default async function fetchAPI<T>({
  baseUrl = process.env.NEXT_PUBLIC_API_URL,
  url,
  request,
}: FetchApiTypes): Promise<[Response | null, null | string]> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const requestHeaders = new Headers(request.headers || {});
    if (token && !requestHeaders.has("Authorization")) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }

    // This is a Next.js-server-to-Express server fetch, so it never carries
    // a browser Origin header - stcbe's tenantOriginMiddleware needs some
    // other signal to know which white-label tenant's domain the visitor is
    // actually on, so we forward the real incoming Host instead. Guarded
    // since headers() throws outside a request-scoped context (e.g.
    // build-time static generation), in which case there's no real visitor
    // to resolve anyway - falls back to the platform's default tenant.
    try {
      const incomingHost = (await headers()).get("host");
      if (incomingHost && !requestHeaders.has("X-Tenant-Host")) {
        requestHeaders.set("X-Tenant-Host", incomingHost);
        if (incomingHost && !requestHeaders.has("X-Tenant-Host-Sig") && process.env.JWT_SECRET) {
          requestHeaders.set("X-Tenant-Host-Sig", createHmac("sha256", process.env.JWT_SECRET).update("tenant-host:" + incomingHost).digest("hex"));
        }
      }
    } catch {
      // No request-scoped headers available - proceed without the hint.
    }


    // Forward the visitor's real IP (signed with the secret both sides share) so the API's per-IP rate limits and audit log see the
    // person, not this server - without it every user shares one rate-limit bucket. See stcbe client-ip.middleware.ts.
    try {
      const incoming = await headers();
      const visitorIp = incoming.get("x-forwarded-for")?.split(",")[0]?.trim() || incoming.get("x-real-ip") || "";
      const secret = process.env.JWT_SECRET;
      if (visitorIp && secret && !requestHeaders.has("X-Client-IP")) {
        requestHeaders.set("X-Client-IP", visitorIp);
        requestHeaders.set("X-Client-IP-Sig", createHmac("sha256", secret).update("client-ip:" + visitorIp).digest("hex"));
      }
    } catch {
      // No request-scoped headers (build time) - nothing to forward.
    }

    const controller = new AbortController();
    // Render's free tier can take 30-50s to cold-start after going idle -
    // long enough that a short timeout here reads as a hung/failed login on
    // the very first request after a period of inactivity.
    const timeout = setTimeout(() => controller.abort(), 45000);

    // Every call through this helper is either a mutation or reflects live,
    // per-user authenticated state (this Authorization header, that tenant's
    // Host) - Next.js's default fetch caching would otherwise cache a GET
    // response in production and keep serving it to every subsequent
    // request/user regardless of who's actually asking. `next dev` masks
    // this (it recompiles/invalidates constantly), which is why it only
    // ever showed up after a real production build.
    const res = await fetch(`${baseUrl}${url}`, {
       ...request,
       headers: requestHeaders,
        signal: controller.signal,
        cache: "no-store",
       });

    clearTimeout(timeout);


    // console.log("The response error is ", req)
    if (!res.ok) {
      let errorMessage = 'Request failed';
      try {
        const data = await res.json();
        console.log("The response error is ", data)
        errorMessage = data.message || errorMessage;
        const reasons = describeErrorDetails(data.details);
        if (reasons) errorMessage = `${errorMessage}: ${reasons}`;
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
