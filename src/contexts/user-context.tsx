"use client"
import { ROUTES } from "@/config/routes"
import { GetUserAction } from "@/server/user"
import { User } from "@/types/user"
import { useRouter } from "next/navigation"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

type UserContextType = {
  user: User | null
  setUser: (user: User | null) => void
  updateUser: (updates: Partial<User>) => void
  logout: () => void
  isLoading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)


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

    fetchUser()
  }, [])

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates })
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      router.push(ROUTES.AUTH.LOGOUT)
      setUser(null)
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
