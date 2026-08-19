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
        cookieStore.delete('token')
        return redirect(`${ROUTES.AUTH.LOGIN}`)
    }

    return redirect(ROUTES.DASHBOARD.HOME)
}
