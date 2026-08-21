"use client"
import { ROUTES } from "@/config/routes"
import { GetUserAction, GetMyPermissionsAction } from "@/server/user"
import { User } from "@/types/user"
import { AdminPermission, MyPermissions } from "@/types/admin-permission"
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
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [permissions, setPermissions] = useState<MyPermissions | null>(null)


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

    fetchUser()
    fetchPermissions()
  }, [])

  const hasPermission = (permission: AdminPermission): boolean => {
    if (permissions === "*") return true
    return permissions?.includes(permission) ?? false
  }

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
