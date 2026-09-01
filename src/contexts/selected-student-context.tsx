"use client"

import { GetLinkedStudentsAction } from "@/server/enrollment"
import { Student } from "@/types/student"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

// Sentinel selectedId meaning "show every linked child combined" rather than
// one specific student - see ChildSwitcherDropdown/ParentHeader for the "All
// Children" option that sets this.
export const ALL_CHILDREN_ID = "all"

type SelectedStudentContextType = {
  students: Student[]
  selectedId: string
  setSelectedId: (id: string) => void
  selectedStudent: Student | null
  isAllSelected: boolean
  isLoading: boolean
  refresh: () => void
}

const SelectedStudentContext = createContext<SelectedStudentContextType | undefined>(undefined)

// Single shared "which of my children is selected" source of truth for the
// parent LMS area - previously every dashboard component fetched
// GetLinkedStudentsAction and tracked its own selectedId independently, so
// switching in one place (e.g. the header) had no effect anywhere else.
export function SelectedStudentProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>([])
  const [selectedId, setSelectedId] = useState<string>(ALL_CHILDREN_ID)
  const [isLoading, setIsLoading] = useState(true)

  const load = async () => {
    setIsLoading(true)
    const [res] = await GetLinkedStudentsAction()
    const list = res?.data ?? []
    setStudents(list)
    setSelectedId((current) =>
      current === ALL_CHILDREN_ID || list.some((s) => s.id === current) ? current : ALL_CHILDREN_ID
    )
    setIsLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const isAllSelected = selectedId === ALL_CHILDREN_ID
  const selectedStudent = isAllSelected ? null : students.find((s) => s.id === selectedId) ?? null

  return (
    <SelectedStudentContext.Provider
      value={{ students, selectedId, setSelectedId, selectedStudent, isAllSelected, isLoading, refresh: load }}
    >
      {children}
    </SelectedStudentContext.Provider>
  )
}

export function useSelectedStudent() {
  const context = useContext(SelectedStudentContext)
  if (context === undefined) {
    throw new Error("useSelectedStudent must be used within a SelectedStudentProvider")
  }
  return context
}
