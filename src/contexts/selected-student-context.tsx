"use client"

import { GetMyStudentsAction } from "@/server/bootstrap"
import { STUDENTS_CACHE_KEY, useUser } from "@/contexts/user-context"
import { useCachedQuery } from "@/lib/client-cache"
import { EnrollmentStatus, Student } from "@/types/student"
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

// Sentinel selectedId meaning "show every linked child combined" rather than
// one specific student - see ChildSwitcherDropdown/ParentHeader for the "All
// Children" option that sets this.
export const ALL_CHILDREN_ID = "all"

// One physical child, with every one of their service enrollments nested
// underneath - groups the flat Student[] list by childId (see stcbe's
// IChild/Student.childId) so a child enrolled in 2 services shows up once,
// not twice. `key` falls back to the enrollment's own id for any
// pre-Child-split record still missing childId (backfill pending) - each
// such record is its own single-enrollment group, same as it looked before
// this grouping existed.
export interface ChildGroup {
  key: string
  fullName: string
  photoUrl?: string
  dateOfBirth?: Date
  gender?: string
  enrollments: Student[]
}

// A Student row's childId is its true "which physical child is this" key -
// `id` alone only coincides with it for a legacy single-enrollment record
// (groupStudentsByChild falls back to `id` when childId is missing). Any
// dashboard widget filtering a raw Student[] list by the switcher's
// selectedId must match on both, since selectedId can be either a specific
// enrollment id (ChildSwitcherDropdown's per-enrollment sub-list) or a
// childId group key (its top-level "one entry per child" list, or
// ParentHeader) - matching on `id` alone silently dropped every enrollment
// for a multi-course child whenever the top-level entry was picked.
export function matchesSelectedStudent(s: Student, selectedId: string): boolean {
  return s.id === selectedId || s.childId === selectedId
}

export function groupStudentsByChild(students: Student[]): ChildGroup[] {
  const groups = new Map<string, ChildGroup>()
  for (const s of students) {
    const key = s.childId || s.id
    let group = groups.get(key)
    if (!group) {
      group = { key, fullName: s.fullName, photoUrl: s.photoUrl, dateOfBirth: s.dateOfBirth, gender: s.gender, enrollments: [] }
      groups.set(key, group)
    }
    group.enrollments.push(s)
  }
  return Array.from(groups.values())
}

// Which of a child's enrollments represents them by default (e.g. for
// single-enrollment displays like ParentHeader) - prefers a
// live/in-progress enrollment over a cancelled/removed one, most recently
// created first.
export function defaultEnrollmentForChild(group: ChildGroup): Student {
  const isTerminal = (s: Student) =>
    s.enrollmentStatus === EnrollmentStatus.CANCELLED || s.enrollmentStatus === EnrollmentStatus.REMOVED
  return [...group.enrollments].sort((a, b) => {
    const terminalDiff = Number(isTerminal(a)) - Number(isTerminal(b))
    if (terminalDiff !== 0) return terminalDiff
    return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
  })[0]
}

type SelectedStudentContextType = {
  students: Student[]
  children: ChildGroup[]
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
async function fetchStudents(): Promise<Student[]> {
  const [list, error] = await GetMyStudentsAction()
  if (error || !list) throw new Error(error ?? "Couldn't load your students")
  return list
}

export function SelectedStudentProvider({ children: reactChildren }: { children: ReactNode }) {
  const { isLoading: isSessionLoading } = useUser()
  const [selectedId, setSelectedId] = useState<string>(ALL_CHILDREN_ID)

  // GetMyStudentsAction merges the children linked via parentUser with the
  // caller's own enrollments: a self-registered adult student has no parent, so
  // their own enrollment(s) only come back from the second source. Merging both
  // is what lets that student use the same child-switcher/Marketplace/dashboard
  // filtering machinery a parent does - for them it ends up holding exactly one
  // "child": themselves. (Both used to be fetched here, one after the other; the
  // session request now seeds this list in the same round trip, so this only
  // fetches on its own once that has settled and the data is stale - see
  // UserProvider - and revisiting any page under this layout reads the cache
  // instantly instead of starting from an empty list.) Waits for the session
  // rather than racing it: Server Actions run one at a time, so asking in
  // parallel just queued a duplicate behind it.
  const { data, isLoading: isStudentsLoading, refresh } = useCachedQuery<Student[]>(STUDENTS_CACHE_KEY, fetchStudents, {
    ttl: 30_000,
    tags: ["enrollments"],
    enabled: !isSessionLoading,
  })

  // A DRAFT is autosaved wizard progress that was never actually
  // submitted - often several of them, one per abandoned/retried
  // attempt at the same child (see enrollment-flow.tsx's dedup fix for
  // Marketplace retries, which reduces but doesn't eliminate these).
  // Showing each as its own switchable "child" here, identically named,
  // is confusing and error-prone (which one is real?) - they belong in
  // the enrollment list's "Continue Registration" flow, not this
  // quick-switcher, so they're excluded here specifically.
  const students = useMemo(() => (data ?? []).filter((s) => s.enrollmentStatus !== EnrollmentStatus.DRAFT), [data])
  const isLoading = isSessionLoading || isStudentsLoading

  useEffect(() => {
    setSelectedId((current) =>
      current === ALL_CHILDREN_ID || students.some((s) => s.id === current || s.childId === current)
        ? current
        : ALL_CHILDREN_ID
    )
  }, [students])

  const childGroups = groupStudentsByChild(students)
  const isAllSelected = selectedId === ALL_CHILDREN_ID

  // selectedId can be either a specific enrollment id (a caller wants one
  // particular service's data) or a child group key (the switcher's normal
  // case) - resolves to that child's default enrollment either way.
  const selectedStudent = isAllSelected
    ? null
    : students.find((s) => s.id === selectedId) ??
      (() => {
        const group = childGroups.find((g) => g.key === selectedId)
        return group ? defaultEnrollmentForChild(group) : null
      })()

  return (
    <SelectedStudentContext.Provider
      value={{
        students,
        children: childGroups,
        selectedId,
        setSelectedId,
        selectedStudent,
        isAllSelected,
        isLoading,
        refresh: () => {
          void refresh()
        },
      }}
    >
      {reactChildren}
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
