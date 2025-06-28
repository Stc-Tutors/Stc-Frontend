import { ROUTES } from "@/config/routes"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function GET() {

    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value;

    if (token) {
        cookieStore.delete('token')
        return redirect(`${ROUTES.AUTH.LOGIN}`)
    }

    return redirect(ROUTES.DASHBOARD.HOME)


}