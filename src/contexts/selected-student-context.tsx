"use client"

import { GetLinkedStudentsAction } from "@/server/enrollment"
import { Student } from "@/types/student"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

type SelectedStudentContextType = {
  students: Student[]
  selectedId: string
  setSelectedId: (id: string) => void
  selectedStudent: Student | null
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
  const [selectedId, setSelectedId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  const load = async () => {
    setIsLoading(true)
    const [res] = await GetLinkedStudentsAction()
    const list = res?.data ?? []
    setStudents(list)
    setSelectedId((current) => (current && list.some((s) => s.id === current) ? current : list[0]?.id ?? ""))
    setIsLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const selectedStudent = students.find((s) => s.id === selectedId) ?? null

  return (
    <SelectedStudentContext.Provider
      value={{ students, selectedId, setSelectedId, selectedStudent, isLoading, refresh: load }}
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
