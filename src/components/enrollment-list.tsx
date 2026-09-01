"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Search,
  Plus,
  Eye, Calendar,
  Clock,
  BookOpen, User,
  Globe,
  GraduationCap,
  Filter,
  AlertTriangle,
  UserMinus,
  KeyRound,
  Copy,
} from "lucide-react"
import { GetEnrollmentsAction, GetLinkedStudentsAction, RemoveLinkedChildAction } from "@/server/enrollment"
import { GetMyRestrictionsAction } from "@/server/subscription"
import { GetMySubjectEnrollmentsAction } from "@/server/subject-enrollment"
import { type Student, EnrollmentStatus, studentLoginId } from "@/types/student"
import { SUBJECT_ENROLLMENT_STATUS_LABELS, SubjectEnrollment, SubjectEnrollmentStatus } from "@/types/subject-enrollment"
import { ToastError, ToastSuccess } from "@/components/ui/custom/toast"

interface EnrollmentListProps {
  // "mine" = the logged-in user's own enrollments (student self-registered);
  // "linked" = students linked to a logged-in parent's account.
  source: "mine" | "linked"
  // e.g. "/lms-home/student/enrollment" - list/new/detail all hang off this.
  basePath: string
}

export default function EnrollmentList({ source, basePath }: EnrollmentListProps) {
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [serviceTypeFilter, setServiceTypeFilter] = useState("all")
  const [enrollmentRestricted, setEnrollmentRestricted] = useState(false)
  const [subjectEnrollments, setSubjectEnrollments] = useState<SubjectEnrollment[]>([])
  const [childToRemove, setChildToRemove] = useState<Student | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)
  const [viewingLoginId, setViewingLoginId] = useState<Student | null>(null)

  useEffect(() => {
    GetMyRestrictionsAction().then(([res]) => setEnrollmentRestricted(!!res?.data?.courseEnrollmentRestricted))
    GetMySubjectEnrollmentsAction().then(([res]) => setSubjectEnrollments(res?.data ?? []))
  }, [])

  useEffect(() => {
    const loadEnrollments = async () => {
      try {
        const [res, error] = source === "linked" ? await GetLinkedStudentsAction() : await GetEnrollmentsAction()
        if (error || !res?.data) {
          console.error("Failed to load enrollments:", error)
          return
        }
        setStudents(res.data)
        setFilteredStudents(res.data)
      } catch (error) {
        console.error("Failed to load enrollments:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadEnrollments()
  }, [source])

  useEffect(() => {
    let filtered = students

    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (student.parentName ?? "").toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((student) => student.enrollmentStatus === statusFilter)
    }

    if (serviceTypeFilter !== "all") {
      filtered = filtered.filter((student) => student.serviceDetails?.serviceType === serviceTypeFilter)
    }

    setFilteredStudents(filtered)
  }, [students, searchTerm, statusFilter, serviceTypeFilter])

  const getStatusColor = (status: EnrollmentStatus) => {
    switch (status) {
      case EnrollmentStatus.ENROLLED:
        return "bg-green-100 text-green-800 border-green-200"
      case EnrollmentStatus.PENDING:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case EnrollmentStatus.DRAFT:
        return "bg-amber-100 text-amber-800 border-amber-200"
      case EnrollmentStatus.COMPLETED:
        return "bg-blue-100 text-blue-800 border-blue-200"
      case EnrollmentStatus.CANCELLED:
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getSubjectStatus = (studentId: string, subject: string) =>
    subjectEnrollments.find((se) => se.student === studentId && se.subject === subject)?.status

  const getSubjectStatusColor = (status: SubjectEnrollmentStatus) => {
    switch (status) {
      case SubjectEnrollmentStatus.ACTIVE:
        return "bg-green-100 text-green-800 border-green-200"
      case SubjectEnrollmentStatus.PENDING_CONFIRMATION:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getInitials = (fullName: string) => {
    const names = fullName.split(" ")
    return names.length >= 2 ? `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}` : fullName.charAt(0)
  }

  const calculateTotalWeeklyHours = (student: Student) => {
    return (student.schedule ?? []).reduce((total, schedule) => {
      return total + schedule.days.length * (schedule.duration / 60)
    }, 0)
  }

  const handleRemoveChild = async () => {
    if (!childToRemove) return
    setIsRemoving(true)
    try {
      const [res, error] = await RemoveLinkedChildAction(childToRemove.id)
      if (error || !res?.data) {
        ToastError(error || "Failed to remove child")
        return
      }
      setStudents((prev) => prev.filter((s) => s.id !== childToRemove.id))
      ToastSuccess(`${childToRemove.fullName} has been removed from your account`)
      setChildToRemove(null)
    } catch {
      ToastError("An unexpected error occurred while removing this child")
    } finally {
      setIsRemoving(false)
    }
  }

  const getUniqueServiceTypes = () => {
    const types = students.map((student) => student.serviceDetails?.serviceType).filter((t): t is string => !!t)
    return [...new Set(types)]
  }

  const getStatusStats = () => {
    const stats = {
      total: students.length,
      draft: students.filter((s) => s.enrollmentStatus === EnrollmentStatus.DRAFT).length,
      enrolled: students.filter((s) => s.enrollmentStatus === EnrollmentStatus.ENROLLED).length,
      pending: students.filter((s) => s.enrollmentStatus === EnrollmentStatus.PENDING).length,
      completed: students.filter((s) => s.enrollmentStatus === EnrollmentStatus.COMPLETED).length,
      cancelled: students.filter((s) => s.enrollmentStatus === EnrollmentStatus.CANCELLED).length,
    }
    return stats
  }

  if (isLoading) {
    return (
      <div className="w-full flex-1 py-8">
        <div className="w-full mx-auto px-4">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const stats = getStatusStats()

  return (
    <div className="w-full flex-1 py-2">
      <div className="w-full mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Enrollment</h1>
              <p className="text-gray-600 mt-1">
                {source === "linked" ? "Manage your children's enrollments" : "Manage and track your enrollments"}
              </p>
            </div>
            <Button
              onClick={() => router.push(`${basePath}/new`)}
              disabled={enrollmentRestricted}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Enrollment
            </Button>
          </div>
        </div>

        {enrollmentRestricted && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                New course enrollment is currently restricted on this account by an administrator. Existing
                enrollments are unaffected. Please contact support to resolve this before adding a new enrollment.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-amber-600">{stats.draft}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.enrolled}</div>
              <div className="text-sm text-gray-600">Enrolled</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
              <div className="text-sm text-gray-600">Cancelled</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by student or parent name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value={EnrollmentStatus.DRAFT}>In Progress</SelectItem>
                    <SelectItem value={EnrollmentStatus.PENDING}>Pending</SelectItem>
                    <SelectItem value={EnrollmentStatus.ENROLLED}>Enrolled</SelectItem>
                    <SelectItem value={EnrollmentStatus.COMPLETED}>Completed</SelectItem>
                    <SelectItem value={EnrollmentStatus.CANCELLED}>Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-48">
                <Select value={serviceTypeFilter} onValueChange={setServiceTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    {getUniqueServiceTypes().map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enrollments List */}
        <div className="space-y-4">
          {filteredStudents.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No enrollments found</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || statusFilter !== "all" || serviceTypeFilter !== "all"
                    ? "Try adjusting your filters to see more results."
                    : "Get started by creating your first enrollment."}
                </p>
                <Button
                  onClick={() => router.push(`${basePath}/new`)}
                  disabled={enrollmentRestricted}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Enrollment
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredStudents.map((student) => (
              <Card key={student.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Student Info */}
                    <div className="flex items-center space-x-4 flex-1">
                      <Avatar className="w-14 h-14">
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-semibold">
                          {getInitials(student.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-xl text-gray-900">{student.fullName}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge className={`${getStatusColor(student.enrollmentStatus)} border`}>
                            {student.enrollmentStatus}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {student.serviceDetails?.ageLevel}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {student.serviceDetails?.serviceType.replace("-", " ")}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {student.parentName}
                          </div>
                          <div className="flex items-center">
                            <Globe className="w-3 h-3 mr-1" />
                            {student.countryOfResidence}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cost and Actions */}
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center text-lg font-bold text-gray-900">
                          ₦{(student.serviceDetails?.totalCost ?? 0).toLocaleString()}
                        </div>
                        <p className="text-sm text-gray-500">total cost</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        {student.enrollmentStatus === EnrollmentStatus.DRAFT && (
                          <Button
                            size="sm"
                            className="bg-amber-600 hover:bg-amber-700"
                            onClick={() => router.push(`${basePath}/new?continue=${student.id}&step=subjects`)}
                          >
                            Continue Registration
                          </Button>
                        )}
                        {student.enrollmentStatus === EnrollmentStatus.PENDING && (
                          <Button
                            size="sm"
                            className="bg-amber-600 hover:bg-amber-700"
                            onClick={() =>
                              router.push(source === "linked" ? "/lms-home/parent/payments" : "/lms-home/student/payments")
                            }
                          >
                            Complete Payment
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => router.push(`${basePath}/${student.id}`)}>
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        {source === "linked" && studentLoginId(student.studentUser) && (
                          <Button variant="outline" size="sm" onClick={() => setViewingLoginId(student)}>
                            <KeyRound className="w-4 h-4 mr-1" />
                            Login ID
                          </Button>
                        )}
                        {source === "linked" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                            onClick={() => setChildToRemove(student)}
                          >
                            <UserMinus className="w-4 h-4 mr-1" />
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Additional Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                    {/* Subjects */}
                    <div>
                      <div className="flex items-center text-gray-600 mb-2">
                        <BookOpen className="w-4 h-4 mr-1" />
                        <span className="font-medium">Subjects</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {student.serviceDetails?.selectedSubjects.slice(0, 3).map((subject) => {
                          const status = getSubjectStatus(student.id, subject)
                          return (
                            <span key={subject} className="flex items-center gap-1">
                              <Badge variant="secondary" className="text-xs">
                                {subject}
                              </Badge>
                              {status && (
                                <Badge className={`${getSubjectStatusColor(status)} border text-[10px]`}>
                                  {SUBJECT_ENROLLMENT_STATUS_LABELS[status]}
                                </Badge>
                              )}
                            </span>
                          )
                        })}
                        {(student.serviceDetails?.selectedSubjects.length ?? 0) > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{(student.serviceDetails?.selectedSubjects.length ?? 0) - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Schedule */}
                    <div>
                      <div className="flex items-center text-gray-600 mb-2">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span className="font-medium">Schedule</span>
                      </div>
                      <div className="space-y-1">
                        {(student.schedule ?? []).slice(0, 2).map((schedule, index) => (
                          <div key={index} className="text-gray-900">
                            <div className="font-medium">{schedule.subject}</div>
                            <div className="text-xs text-gray-600">
                              {schedule.days.join(", ")} at {schedule.time}
                            </div>
                          </div>
                        ))}
                        {(student.schedule ?? []).length > 2 && (
                          <div className="text-xs text-gray-500">+{(student.schedule ?? []).length - 2} more sessions</div>
                        )}
                      </div>
                    </div>

                    {/* Weekly Hours & Tutor */}
                    <div>
                      <div className="flex items-center text-gray-600 mb-2">
                        <Clock className="w-4 h-4 mr-1" />
                        <span className="font-medium">Details</span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-gray-900">
                          <span className="font-medium">{calculateTotalWeeklyHours(student).toFixed(1)} hrs</span>
                          <span className="text-gray-600 text-xs ml-1">per week</span>
                        </div>
                        <div className="text-gray-900">
                          <span className="font-medium">{student.serviceDetails?.tutorGender}</span>
                          <span className="text-gray-600 text-xs ml-1">tutor</span>
                        </div>
                        <div className="text-gray-600 text-xs">Focus: {student.serviceDetails?.learningFocus}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Summary */}
        {filteredStudents.length > 0 && (
          <Card className="mt-6">
            <CardContent className="p-4">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>
                  Showing {filteredStudents.length} of {students.length} enrollments
                </span>
                <span>
                  Total weekly hours:{" "}
                  {filteredStudents
                    .reduce((total, student) => total + calculateTotalWeeklyHours(student), 0)
                    .toFixed(1)}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog open={!!childToRemove} onOpenChange={(open) => !open && setChildToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {childToRemove?.fullName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes {childToRemove?.fullName} from your account - they'll no longer appear in your dashboard,
              child switcher, or schedule. Their payment and lesson history is kept and an administrator can restore
              access if this was a mistake. This does not cancel any active lessons directly - contact support if you
              also need those cancelled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleRemoveChild()
              }}
              disabled={isRemoving}
              className="bg-red-600 hover:bg-red-700"
            >
              {isRemoving ? "Removing..." : "Remove Child"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!viewingLoginId} onOpenChange={(open) => !open && setViewingLoginId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewingLoginId?.fullName}&apos;s Login ID</DialogTitle>
            <DialogDescription>
              Your child logs in with this Student ID and the password you set for them - no email required.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center gap-2 bg-blue-50 border border-blue-200 rounded-lg py-3 px-4">
            <span className="text-lg font-mono font-semibold text-blue-900">
              {studentLoginId(viewingLoginId?.studentUser)}
            </span>
            <button
              type="button"
              onClick={() => {
                const id = studentLoginId(viewingLoginId?.studentUser)
                if (!id) return
                navigator.clipboard.writeText(id)
                ToastSuccess("Copied to clipboard")
              }}
              className="text-blue-600 hover:text-blue-800"
              aria-label="Copy Student ID"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
