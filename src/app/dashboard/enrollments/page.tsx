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
  ArrowLeft,
  Search,
  Plus,
  Eye, Calendar,
  Clock,
  BookOpen, User,
  Globe,
  GraduationCap,
  Filter
} from "lucide-react"
import { GetEnrollmentsAction } from "@/server/enrollment"
import { type Student, EnrollmentStatus } from "@/types/student"
import { ROUTES } from "@/config/routes"

export default function EnrollmentsPage() {
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [serviceTypeFilter, setServiceTypeFilter] = useState("all")

  useEffect(() => {
    const loadEnrollments = async () => {
      try {
        const [res, error] = await GetEnrollmentsAction()
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
  }, [])

  useEffect(() => {
    let filtered = students

    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.parentName.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((student) => student.enrollmentStatus === statusFilter)
    }

    if (serviceTypeFilter !== "all") {
      filtered = filtered.filter((student) => student.serviceDetails.serviceType === serviceTypeFilter)
    }

    setFilteredStudents(filtered)
  }, [students, searchTerm, statusFilter, serviceTypeFilter])

  const getStatusColor = (status: EnrollmentStatus) => {
    switch (status) {
      case EnrollmentStatus.ENROLLED:
        return "bg-green-100 text-green-800 border-green-200"
      case EnrollmentStatus.PENDING:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case EnrollmentStatus.COMPLETED:
        return "bg-blue-100 text-blue-800 border-blue-200"
      case EnrollmentStatus.CANCELLED:
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getInitials = (fullName: string) => {
    const names = fullName.split(" ")
    return names.length >= 2 ? `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}` : fullName.charAt(0)
  }

  const calculateTotalWeeklyHours = (student: Student) => {
    return student.schedule.reduce((total, schedule) => {
      return total + schedule.days.length * (schedule.duration / 60)
    }, 0)
  }

  const handleStatusChange = async (studentId: string, newStatus: EnrollmentStatus) => {
    try {
      // This would be your API call to update the status
      const response = await fetch(`/api/enrollments/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setStudents((prev) =>
          prev.map((student) => (student.id === studentId ? { ...student, enrollmentStatus: newStatus } : student)),
        )
      }
    } catch (error) {
      console.error("Failed to update status:", error)
    }
  }

  const getUniqueServiceTypes = () => {
    const types = students.map((student) => student.serviceDetails.serviceType)
    return [...new Set(types)]
  }

  const getStatusStats = () => {
    const stats = {
      total: students.length,
      enrolled: students.filter((s) => s.enrollmentStatus === EnrollmentStatus.ENROLLED).length,
      pending: students.filter((s) => s.enrollmentStatus === EnrollmentStatus.PENDING).length,
      completed: students.filter((s) => s.enrollmentStatus === EnrollmentStatus.COMPLETED).length,
      cancelled: students.filter((s) => s.enrollmentStatus === EnrollmentStatus.CANCELLED).length,
    }
    return stats
  }

  if (isLoading) {
    return (
      <div className="w-full flex-1 bg-gray-50 py-8">
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
    <div className="w-full flex-1 bg-gray-50 py-8">
      <div className="w-full mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.push(ROUTES.DASHBOARD.HOME)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Enrollments</h1>
              <p className="text-gray-600 mt-1">Manage and monitor all student enrollments</p>
            </div>
            <Button onClick={() => router.push("/dashboard/enroll")} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Enrollment
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
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
                <Button onClick={() => router.push("/dashboard/enroll")} className="bg-blue-600 hover:bg-blue-700">
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
                            {student.serviceDetails.ageLevel}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {student.serviceDetails.serviceType.replace("-", " ")}
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
                          ₦{student.serviceDetails.totalCost.toLocaleString()}
                        </div>
                        <p className="text-sm text-gray-500">total cost</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/enrollments/${student.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>

                        {/* {student.enrollmentStatus === EnrollmentStatus.PENDING && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/dashboard/enroll?continue=${student.id}`)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Continue
                          </Button>
                        )}

                        {student.enrollmentStatus === EnrollmentStatus.ENROLLED && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(student.id, EnrollmentStatus.CANCELLED)}
                          >
                            <Pause className="w-4 h-4 mr-1" />
                            Pause
                          </Button>
                        )}

                        {student.enrollmentStatus === EnrollmentStatus.CANCELLED && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(student.id, EnrollmentStatus.ENROLLED)}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Resume
                          </Button>
                        )} */}
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
                        {student.serviceDetails.selectedSubjects.slice(0, 3).map((subject) => (
                          <Badge key={subject} variant="secondary" className="text-xs">
                            {subject}
                          </Badge>
                        ))}
                        {student.serviceDetails.selectedSubjects.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{student.serviceDetails.selectedSubjects.length - 3} more
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
                        {student.schedule.slice(0, 2).map((schedule, index) => (
                          <div key={index} className="text-gray-900">
                            <div className="font-medium">{schedule.subject}</div>
                            <div className="text-xs text-gray-600">
                              {schedule.days.join(", ")} at {schedule.time}
                            </div>
                          </div>
                        ))}
                        {student.schedule.length > 2 && (
                          <div className="text-xs text-gray-500">+{student.schedule.length - 2} more sessions</div>
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
                          <span className="font-medium">{student.serviceDetails.tutorGender}</span>
                          <span className="text-gray-600 text-xs ml-1">tutor</span>
                        </div>
                        <div className="text-gray-600 text-xs">Focus: {student.serviceDetails.learningFocus}</div>
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
    </div>
  )
}
