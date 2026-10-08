import { ROUTES } from "@/config/routes"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// POST only - a GET here would be reachable by Next.js's automatic <Link>
// prefetching (it silently issues a background GET for any visible link,
// including this one in every sidebar), which used to log every user out
// just from the Logout link being on screen, with no click involved.
export async function POST() {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value;

    if (token) {
        // Tell the API to revoke this session token too - clearing the cookie alone left the token usable for its remaining 24 hours.
        // Best effort: a slow or unreachable API must never stop the user from logging out here.
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                signal: AbortSignal.timeout(4000),
            })
        } catch {
            // fall through to clearing the cookie
        }
        cookieStore.delete('token')
        return redirect(`${ROUTES.AUTH.LOGIN}`)
    }

    return redirect(ROUTES.DASHBOARD.HOME)
}
