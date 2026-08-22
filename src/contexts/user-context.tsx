"use client"
import { ROUTES } from "@/config/routes"
import { GetUserAction, GetMyPermissionsAction } from "@/server/user"
import { GetMyHodAssignmentAction } from "@/server/hod"
import { User } from "@/types/user"
import { AdminPermission, MyPermissions } from "@/types/admin-permission"
import { HodAssignment, HodPermission, hodHasPermission } from "@/types/hod"
import { useRouter } from "next/navigation"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

type UserContextType = {
  user: User | null
  setUser: (user: User | null) => void
  updateUser: (updates: Partial<User>) => void
  logout: () => void
  isLoading: boolean
  permissions: MyPermissions | null
  hasPermission: (permission: AdminPermission) => boolean
  // HOD status is additive (see stcbe's HodService.assign) - a Tutor or
  // Admin keeps their own role/permissions in full and simply gains
  // whatever hodAssignment.hodScopes grant on top. null means "confirmed no
  // assignment", not "still loading" - check isLoading for that.
  hodAssignment: HodAssignment | null
  hasHodPermission: (permission: HodPermission) => boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [permissions, setPermissions] = useState<MyPermissions | null>(null)
  const [hodAssignment, setHodAssignment] = useState<HodAssignment | null>(null)


    useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true)
      try {
      const [res, error] = await GetUserAction()

        if (!res || error) {
          console.error("Failed to fetch user:", error)
          setUser(null)
          return;
        }
        if (res.data) {
          setUser(res.data)
        }

      } catch  {
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    const fetchPermissions = async () => {
      const [res] = await GetMyPermissionsAction()
      setPermissions(res?.data ?? [])
    }

    // HOD status is additive, so this is fetched for every logged-in user
    // regardless of role - a 404 (the common case: no assignment) is an
    // expected outcome here, not an error to surface.
    const fetchHodAssignment = async () => {
      const [res] = await GetMyHodAssignmentAction()
      setHodAssignment(res?.data ?? null)
    }

    fetchUser()
    fetchPermissions()
    fetchHodAssignment()
  }, [])

  const hasPermission = (permission: AdminPermission): boolean => {
    if (permissions === "*") return true
    return permissions?.includes(permission) ?? false
  }

  const hasHodPermission = (permission: HodPermission): boolean => hodHasPermission(hodAssignment, permission)

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates })
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      // ROUTES.AUTH.LOGOUT ("/api/auth/logout") is a POST-only route handler
      // that clears the httpOnly session cookie server-side - it must be hit
      // with an actual POST fetch, not a client-side navigation/router.push,
      // which was a dead-page GET that never cleared the cookie (the user
      // stayed logged in on refresh). See LogoutButton.tsx for the same pattern.
      await fetch(ROUTES.AUTH.LOGOUT, { method: "POST" })
      setUser(null)
      router.push(ROUTES.AUTH.LOGIN)
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    user,
    setUser,
    updateUser,
    logout,
    isLoading,
    permissions,
    hasPermission,
    hodAssignment,
    hasHodPermission,
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
