"use client"
import { ROUTES } from "@/config/routes"
import { GetSessionBootstrapAction, type SessionBootstrap } from "@/server/bootstrap"
import { User } from "@/types/user"
import { AdminPermission, MyPermissions } from "@/types/admin-permission"
import { HodAssignment, HodPermission, hodHasPermission } from "@/types/hod"
import { SubscriptionRestrictions } from "@/types/subscription"
import { Student } from "@/types/student"
import { bindCacheToUser, clearClientCache, NoRetryError, setCached, useCachedQuery } from "@/lib/client-cache"
import { usePathname, useRouter } from "next/navigation"
import { createContext, useContext, useEffect, useRef, type ReactNode } from "react"

// The only two trees that require a session - see config/routes.ts. Every
// other route (the public marketing site, /auth/*) is meant to be browsed
// with no session at all, so it must never trigger the session check below.
function isProtectedPath(pathname: string | null): boolean {
  return Boolean(pathname && (pathname.startsWith("/dashboard") || pathname.startsWith("/lms-home")))
}

export const SESSION_CACHE_KEY = "session"
export const STUDENTS_CACHE_KEY = "my-students"

type UserContextType = {
  user: User | null
  // Keeps the shared session cache (and so every consumer) in step with a
  // change made in the UI - see updateUser.
  setUser: (user: User | null) => void
  updateUser: (updates: Partial<User>) => void
  logout: () => void
  // True from the moment a protected page starts loading until the session,
  // permissions and HOD assignment have ALL arrived (or failed). It used to flip
  // to false as soon as the user alone loaded, so a page could briefly see a real
  // user but no permissions yet and flash a "no access" state.
  isLoading: boolean
  permissions: MyPermissions | null
  hasPermission: (permission: AdminPermission) => boolean
  // HOD status is additive (see stcbe's HodService.assign) - a Tutor or
  // Admin keeps their own role/permissions in full and simply gains
  // whatever hodAssignment.hodScopes grant on top. null means "confirmed no
  // assignment", not "still loading" - check isLoading for that.
  hodAssignment: HodAssignment | null
  hasHodPermission: (permission: HodPermission) => boolean
  // Fetched together with the session for STUDENT/PARENT (null for other
  // roles, or while loading) so the access gate and the child switcher don't
  // each make their own request - see SessionBootstrap.
  restrictions: SubscriptionRestrictions | null
  bootstrapStudents: Student[] | null
  // Set when the session could not be loaded and there is nothing cached to show
  // (offline, API waking up). The layouts show a retry screen for it instead of
  // a blank page.
  sessionError: string | null
  retrySession: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

async function loadSession(): Promise<SessionBootstrap> {
  const result = await GetSessionBootstrapAction()
  // A 401 is the only reason to treat the session as dead. Anything else (a
  // timeout, the API cold-starting, no signal on a train) must not log the
  // person out - it is retried, and cached data keeps the page usable meanwhile.
  if (result.unauthorized) throw new NoRetryError("Unauthorized")
  if (!result.data) throw new Error(result.error ?? "Couldn't load your session")
  return result.data
}

export function UserProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  // Only runs for a protected route, and only once per transition into one (the
  // key is constant, so navigating between protected pages reuses the cached
  // session instead of re-fetching it) - never on public pages: an anonymous
  // visitor idling on the homepage must not hit the API and get bounced to /login.
  const isProtectedRoute = isProtectedPath(pathname)
  const { data, error, isLoading: isSessionLoading, refresh } = useCachedQuery<SessionBootstrap>(SESSION_CACHE_KEY, loadSession, {
    ttl: 60_000,
    tags: ["session"],
    // Paints the shell from the last session on a full reload/reopen (mobile
    // browsers discard background tabs constantly) while the fresh one loads.
    // sessionStorage: per-tab, and wiped by clearClientCache on logout.
    persist: true,
    enabled: isProtectedRoute,
  })

  const user = data?.user ?? null
  const permissions = data?.permissions ?? null
  const hodAssignment = data?.hodAssignment ?? null
  const restrictions = data?.restrictions ?? null
  const bootstrapStudents = data?.students ?? null

  // Whatever is cached belongs to whoever is signed in - drop it when that changes.
  useEffect(() => {
    if (user) bindCacheToUser(user.id)
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Seed the children list from the same round trip so SelectedStudentProvider
  // finds it fresh instead of asking again.
  useEffect(() => {
    if (bootstrapStudents) setCached(STUDENTS_CACHE_KEY, bootstrapStudents, { tags: ["enrollments"] })
  }, [bootstrapStudents])

  const loggedOutRef = useRef(false)
  useEffect(() => {
    // A 401 means the session cookie no longer maps to a real user (e.g. the
    // account was deleted) - clear the stale cookie and send them to login
    // instead of leaving them on a page that has no user to render.
    if (error?.name === "NoRetryError" && !loggedOutRef.current) {
      loggedOutRef.current = true
      void logout()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error])

  const hasPermission = (permission: AdminPermission): boolean => {
    if (permissions === "*") return true
    return permissions?.includes(permission) ?? false
  }

  const hasHodPermission = (permission: HodPermission): boolean => hodHasPermission(hodAssignment, permission)

  const updateUser = (updates: Partial<User>) => {
    if (data) setCached(SESSION_CACHE_KEY, { ...data, user: { ...data.user, ...updates } }, { tags: ["session"], persist: true })
  }

  const setUser = (next: User | null) => {
    if (next === null) clearClientCache()
    else if (data) setCached(SESSION_CACHE_KEY, { ...data, user: next }, { tags: ["session"], persist: true })
  }

  const logout = async () => {
    try {
      // ROUTES.AUTH.LOGOUT ("/api/auth/logout") is a POST-only route handler
      // that clears the httpOnly session cookie server-side - it must be hit
      // with an actual POST fetch, not a client-side navigation/router.push,
      // which was a dead-page GET that never cleared the cookie (the user
      // stayed logged in on refresh). See LogoutButton.tsx for the same pattern.
      await fetch(ROUTES.AUTH.LOGOUT, { method: "POST" })
      clearClientCache()
      router.push(ROUTES.AUTH.LOGIN)
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const value: UserContextType = {
    user,
    setUser,
    updateUser,
    logout,
    isLoading: isProtectedRoute && isSessionLoading,
    permissions,
    hasPermission,
    hodAssignment,
    hasHodPermission,
    restrictions,
    bootstrapStudents,
    sessionError: !user && error && error.name !== "NoRetryError" ? error.message : null,
    retrySession: () => {
      void refresh()
    },
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
