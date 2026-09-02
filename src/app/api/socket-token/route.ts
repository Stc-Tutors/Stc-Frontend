import { NextResponse } from "next/server";
import fetchAPI from "@/lib/fetch";

// Bridges the httpOnly "token" cookie (unreachable from client JS, see
// server/auth.ts) to the browser so it can authenticate a Socket.IO
// connection. This used to just echo the real session JWT back to the
// client - a 24h, full-API-privilege bearer token - which meant any XSS
// able to run JS on this page could call this same-origin route and walk
// away with something usable against the entire REST API from anywhere, not
// just the socket handshake. Instead this asks the backend to mint a
// narrow, 5-minute, socket-only token (see stcbe's AuthService.
// issueSocketToken) and hands back that instead - the real session cookie
// is never exposed to client JS at all.
export async function GET() {
  const [res] = await fetchAPI<{ token: string }>({
    url: "/auth/socket-token",
    request: { method: "GET" },
  });

  if (!res) {
    return NextResponse.json({ token: null }, { status: 401 });
  }

  const body = (await res.json()) as { data?: { token: string } };
  return NextResponse.json({ token: body.data?.token ?? null });
}
