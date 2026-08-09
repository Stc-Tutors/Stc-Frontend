"use client"

import { useSelectedStudent } from "@/contexts/selected-student-context"
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

// Lets a parent instantly switch which linked child's dashboard data they're
// viewing, from anywhere in the parent LMS header - see
// SelectedStudentProvider for the shared selection state every dashboard
// component should read from.
export function ChildSwitcherDropdown() {
  const { students, selectedId, setSelectedId, selectedStudent, isLoading } = useSelectedStudent()

  if (isLoading) return null
  if (students.length === 0) return null

  const getInitials = (fullName: string) =>
    fullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n.charAt(0))
      .join("")

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
            {selectedStudent?.fullName ?? "Select child"}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Viewing dashboard for</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {students.map((s) => (
          <DropdownMenuItem
            key={s.id}
            className="cursor-pointer"
            onClick={() => setSelectedId(s.id)}
            data-active={s.id === selectedId}
          >
            <Avatar className="w-5 h-5 mr-2">
              <AvatarImage src={s.photoUrl || "/placeholder.svg"} alt={s.fullName} />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-[10px]">
                {getInitials(s.fullName)}
              </AvatarFallback>
            </Avatar>
            <span className={s.id === selectedId ? "font-medium" : ""}>{s.fullName}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
