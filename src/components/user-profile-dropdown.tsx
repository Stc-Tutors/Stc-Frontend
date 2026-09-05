"use client"
import { useRouter } from "next/navigation"
import { useUser } from "@/contexts/user-context"
import { lmsDashboardPath } from "@/config/routes"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LayoutDashboard, LogOut, ChevronDown } from "lucide-react"

export function UserProfileDropdown() {
  const router = useRouter()
  const { user, logout, isLoading, hodAssignment } = useUser()

  if (!user) return null

  // HOD status is additive (see stcbe's HodService.assign) - a Tutor/Admin's
  // `user.role` stays their own, so this badge is the only place that ever
  // surfaces "you're also HOD" without navigating to My HOD Scope.
  const isAlsoHod = !!hodAssignment && hodAssignment.hodScopes.length > 0

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-3 h-auto p-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user?.profilePicture || "/placeholder.svg"} alt={`${user.firstName} ${user.lastName}`} />
            <AvatarFallback className="bg-blue-100 text-blue-600">
              {getInitials(user.firstName, user.lastName)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-gray-900">
              {user.firstName} {user.lastName}
            </p>
            <div className="flex items-center gap-1.5">
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              {isAlsoHod && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 leading-tight">
                  Also HOD
                </Badge>
              )}
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-gray-500">{user.email}</p>
            {isAlsoHod && (
              <Badge variant="outline" className="w-fit text-[10px] px-1.5 py-0 leading-tight">
                Also Head of Department
              </Badge>
            )}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="cursor-pointer" onClick={() => router.push(lmsDashboardPath(user.role))}>
          <LayoutDashboard className="w-4 h-4 mr-2" />
          Dashboard
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600"
          onClick={logout}
          disabled={isLoading}
        >
          <LogOut className="w-4 h-4 mr-2" />
          {isLoading ? "Logging out..." : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
