"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ArrowLeft, User,
  Calendar,
  Clock,
  BookOpen, Globe,
  Phone,
  Mail,
  GraduationCap,
  Target,
  Users,
  MapPin,
  Languages,
  AlertTriangle
} from "lucide-react"
import { type Student, EnrollmentStatus } from "@/types/student"
import { ROUTES } from "@/config/routes"
import { GetEnrollmentAction } from "@/server/enrollment"
import { FaMoneyBill } from "react-icons/fa"


export default function EnrollmentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const enrollmentId = params?.id as string

  const [student, setStudent] = useState<Student | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<EnrollmentStatus | null>(null)

  useEffect(() => {
    const loadEnrollment = async () => {
      if (!enrollmentId) return

      try {
        const [data, error] = await GetEnrollmentAction(enrollmentId)
        if (!data?.data || error) {
          setError(error || "Enrollment not found")
          return
        }
        setStudent(data.data)
      } catch (error) {
        setError("Failed to load enrollment details")
        console.error("Failed to load enrollment:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadEnrollment()
  }, [enrollmentId])

  const getInitials = (fullName: string) => {
    const names = fullName.split(" ")
    return names.length >= 2 ? `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}` : fullName.charAt(0)
  }

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

  const calculateTotalWeeklyHours = () => {
    if (!student) return 0
    return student.schedule.reduce((total, schedule) => {
      return total + schedule.days.length * (schedule.duration / 60)
    }, 0)
  }

  const calculateAge = (dateOfBirth: Date) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const handleStatusChange = async (newStatus: EnrollmentStatus) => {
    if (!student) return

    try {
      const response = await fetch(`/api/enrollments/${student.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setStudent({ ...student, enrollmentStatus: newStatus })
        setIsStatusDialogOpen(false)
      }
    } catch (error) {
      console.error("Failed to update status:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="w-full flex-1 bg-gray-50 py-8">
        <div className="w-full mx-auto px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !student) {
    return (
      <div className="w-full flex-1 bg-gray-50 py-8">
        <div className="w-full mx-auto px-4">
          <Button variant="ghost" onClick={() => router.push(ROUTES.DASHBOARD.HOME)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Enrollments
          </Button>
          <Card>
            <CardContent className="p-12 text-center">
              <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Enrollment Not Found</h3>
              <p className="text-gray-600 mb-6">{error || "The enrollment you're looking for doesn't exist."}</p>
              <Button onClick={() => router.push("/dashboard/enrollments")}>View All Enrollments</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full flex-1 bg-gray-50 py-8">
      <div className="w-full mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.push("/dashboard/enrollments")} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Enrollments
          </Button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-blue-100 text-blue-600 text-xl font-semibold">
                  {getInitials(student.fullName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{student.fullName}</h1>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge className={`${getStatusColor(student.enrollmentStatus)} border`}>
                    {student.enrollmentStatus}
                  </Badge>
                  <Badge variant="outline">{student.serviceDetails.ageLevel}</Badge>
                  <Badge variant="secondary">{student.serviceDetails.serviceType.replace("-", " ")}</Badge>
                </div>
              </div>
            </div>

            {/* <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => router.push(`/dashboard/enroll?edit=${student.id}`)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>

              {student.enrollmentStatus === EnrollmentStatus.ENROLLED && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedStatus(EnrollmentStatus.CANCELLED)
                    setIsStatusDialogOpen(true)
                  }}
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
              )}

              {student.enrollmentStatus === EnrollmentStatus.CANCELLED && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedStatus(EnrollmentStatus.ENROLLED)
                    setIsStatusDialogOpen(true)
                  }}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </Button>
              )}

              {student.enrollmentStatus === EnrollmentStatus.PENDING && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedStatus(EnrollmentStatus.ENROLLED)
                    setIsStatusDialogOpen(true)
                  }}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Activate
                </Button>
              )}
            </div> */}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{calculateTotalWeeklyHours().toFixed(1)}</div>
              <div className="text-sm text-gray-600">Hours/Week</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{student.serviceDetails.selectedSubjects.length}</div>
              <div className="text-sm text-gray-600">Subjects</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{student.schedule.length}</div>
              <div className="text-sm text-gray-600">Sessions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <FaMoneyBill className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {student.serviceDetails.totalCost.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Cost</div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="service">Service Details</TabsTrigger>
            <TabsTrigger value="contact">Contact Info</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Student Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Student Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Full Name:</span>
                      <p className="font-medium text-gray-900">{student.fullName}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Age:</span>
                      <p className="font-medium text-gray-900">{calculateAge(student.dateOfBirth)} years old</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Gender:</span>
                      <p className="font-medium text-gray-900">{student.gender}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Date of Birth:</span>
                      <p className="font-medium text-gray-900">{new Date(student.dateOfBirth).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Primary Language:</span>
                      <p className="font-medium text-gray-900 flex items-center">
                        <Languages className="w-3 h-3 mr-1" />
                        {student.primaryLanguage}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Country:</span>
                      <p className="font-medium text-gray-900 flex items-center">
                        <Globe className="w-3 h-3 mr-1" />
                        {student.countryOfResidence}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Parent Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Parent/Guardian Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-600">Parent Name:</span>
                      <p className="font-medium text-gray-900">{student.parentName}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <p className="font-medium text-gray-900 flex items-center">
                        <Mail className="w-3 h-3 mr-1" />
                        {student.parentEmail}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <p className="font-medium text-gray-900 flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        {student.parentPhone}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Student Phone:</span>
                      <p className="font-medium text-gray-900 flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        {student.phone}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Learning Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Learning Goals & Focus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <span className="text-gray-600 text-sm">Learning Focus:</span>
                    <p className="font-medium text-gray-900 mt-1">{student.serviceDetails.learningFocus}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Learning Goals:</span>
                    <p className="font-medium text-gray-900 mt-1">{student.serviceDetails.learningGoals}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Weekly Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {student.schedule.map((schedule, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-lg text-gray-900">{schedule.subject}</h4>
                        <Badge variant="outline">{schedule.duration} minutes</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Days:</span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {schedule.days.map((day) => (
                              <Badge key={day} variant="secondary" className="text-xs">
                                {day}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Time:</span>
                          <p className="font-medium text-gray-900 mt-1 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {schedule.time}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Weekly Hours:</span>
                          <p className="font-medium text-gray-900 mt-1">
                            {(schedule.days.length * (schedule.duration / 60)).toFixed(1)} hours
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Service Details Tab */}
          <TabsContent value="service" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <GraduationCap className="w-5 h-5 mr-2" />
                    Service Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Service Type:</span>
                      <p className="font-medium text-gray-900">
                        {student.serviceDetails.serviceType.replace("-", " ")}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Age Level:</span>
                      <p className="font-medium text-gray-900">{student.serviceDetails.ageLevel}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Preferred Tutor Gender:</span>
                      <p className="font-medium text-gray-900">{student.serviceDetails.tutorGender}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Cost:</span>
                      <p className="font-medium text-gray-900 text-lg flex items-center">
                        ₦{student.serviceDetails.totalCost.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Selected Subjects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {student.serviceDetails.selectedSubjects.map((subject, index) => (
                      <Badge key={index} variant="outline" className="text-sm">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Contact Info Tab */}
          <TabsContent value="contact" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Phone className="w-5 h-5 mr-2" />
                    Contact Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Parent Email</p>
                        <p className="text-sm text-gray-600">{student.parentEmail}</p>
                      </div>
                      <Mail className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Parent Phone</p>
                        <p className="text-sm text-gray-600">{student.parentPhone}</p>
                      </div>
                      <Phone className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Student Phone</p>
                        <p className="text-sm text-gray-600">{student.phone}</p>
                      </div>
                      <Phone className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Location Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Country of Residence</p>
                        <p className="text-sm text-gray-600">{student.countryOfResidence}</p>
                      </div>
                      <Globe className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Primary Language</p>
                        <p className="text-sm text-gray-600">{student.primaryLanguage}</p>
                      </div>
                      <Languages className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Status Change Dialog */}
        <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Enrollment Status</DialogTitle>
              <DialogDescription>
                Are you sure you want to change the enrollment status to{" "}
                <span className="font-semibold">{selectedStatus}</span>?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => selectedStatus && handleStatusChange(selectedStatus)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Confirm Change
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
