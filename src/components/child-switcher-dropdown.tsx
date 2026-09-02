"use client"

import { ALL_CHILDREN_ID, useSelectedStudent } from "@/contexts/selected-student-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Users } from "lucide-react"

const serviceLabel = (s: { serviceDetails?: { learningFocus?: string; serviceType?: string } }) =>
  s.serviceDetails?.learningFocus || s.serviceDetails?.serviceType

const getInitials = (fullName: string) =>
  fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n.charAt(0))
    .join("")

// Lets a parent instantly switch which linked child's dashboard data they're
// viewing, from anywhere in the parent LMS header - see
// SelectedStudentProvider for the shared selection state every dashboard
// component should read from. One row per real child (see ChildGroup) - a
// child enrolled in more than one service shows those as a nested sub-list
// instead of repeating the child's name as if it were a separate child.
export function ChildSwitcherDropdown() {
  const { children, selectedId, setSelectedId, selectedStudent, isAllSelected, isLoading } = useSelectedStudent()

  if (isLoading) return null
  if (children.length === 0) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost" className="flex items-center space-x-2 h-auto p-2">
          <Avatar className="w-7 h-7">
            <AvatarImage src={selectedStudent?.photoUrl || "/placeholder.svg"} alt={selectedStudent?.fullName} />
            <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
              {selectedStudent ? getInitials(selectedStudent.fullName) : <Users className="w-4 h-4" />}
            </AvatarFallback>
          </Avatar>
          <span className="hidden md:block text-sm font-medium text-gray-900 max-w-[120px] truncate">
            {selectedStudent?.fullName ?? "All Children"}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Viewing dashboard for</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => setSelectedId(ALL_CHILDREN_ID)}
          data-active={isAllSelected}
        >
          <div className="w-5 h-5 mr-2 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <Users className="w-3 h-3" />
          </div>
          <span className={isAllSelected ? "font-medium" : ""}>All Children</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {children.map((child) => {
          const isChildActive = selectedId === child.key || child.enrollments.some((e) => e.id === selectedId)
          return (
            <div key={child.key}>
              <DropdownMenuItem className="cursor-pointer" onClick={() => setSelectedId(child.key)} data-active={isChildActive}>
                <Avatar className="w-5 h-5 mr-2">
                  <AvatarImage src={child.photoUrl || "/placeholder.svg"} alt={child.fullName} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-[10px]">
                    {getInitials(child.fullName)}
                  </AvatarFallback>
                </Avatar>
                <span className={isChildActive ? "font-medium" : ""}>{child.fullName}</span>
              </DropdownMenuItem>
              {child.enrollments.length > 1 &&
                child.enrollments.map((e) => (
                  <DropdownMenuItem
                    key={e.id}
                    className="cursor-pointer pl-9"
                    onClick={() => setSelectedId(e.id)}
                    data-active={e.id === selectedId}
                  >
                    <span className={`text-xs ${e.id === selectedId ? "font-medium text-gray-900" : "text-gray-500"}`}>
                      {serviceLabel(e) || "Enrollment"}
                    </span>
                  </DropdownMenuItem>
                ))}
            </div>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
