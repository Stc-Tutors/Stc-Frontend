import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Bridges the httpOnly "token" cookie (unreachable from client JS, see
// server/auth.ts) to the browser so it can authenticate a Socket.IO
// connection - the client hits this same-origin route, which reads the
// cookie server-side and hands the JWT back. This doesn't weaken anything:
// the browser making this request already *is* the authenticated session: it
// already carries the httpOnly cookie on every request to this app and can
// already do anything that token allows via the existing server actions.
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ token: null }, { status: 401 });
  }

  return NextResponse.json({ token });
}
