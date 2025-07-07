"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  User,
  Calendar,
  Clock,
  BookOpen,
  CreditCard,
  GraduationCap,
  Globe,
  Phone,
  Mail,
} from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { GetEnrollmentsAction } from "@/server/enrollment";
import { type Student, EnrollmentStatus } from "@/types/student";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useUser();
  const [expandedCards, setExpandedCards] = useState<number[]>([]);
  const [children, setChildren] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const [res, error] = await GetEnrollmentsAction();
        if (error || !res?.data) {
          return;
        }
        setChildren(res.data);
      } catch (error) {
        console.error("Failed to fetch children data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchChildren();
  }, []);

  const toggleCardExpansion = (index: number) => {
    setExpandedCards(prev => (prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]));
  };

  const getInitials = (fullName: string) => {
    const names = fullName.split(" ");
    return names.length >= 2 ? `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}` : fullName.charAt(0);
  };

  const getStatusColor = (status: EnrollmentStatus) => {
    switch (status) {
      case EnrollmentStatus.ENROLLED:
        return "bg-green-100 text-green-800";
      case EnrollmentStatus.PENDING:
        return "bg-yellow-100 text-yellow-800";
      case EnrollmentStatus.COMPLETED:
        return "bg-blue-100 text-blue-800";
      case EnrollmentStatus.CANCELLED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculateStats = () => {
    const totalChildren = children.length;
    const activeSessions = children.filter(child => child.enrollmentStatus === EnrollmentStatus.ENROLLED).length;
    const totalWeeklyHours = children.reduce((total, child) => {
      return (
        total +
        child.schedule.reduce((childTotal, schedule) => {
          return childTotal + schedule.days.length * (schedule.duration / 60);
        }, 0)
      );
    }, 0);

    return { totalChildren, activeSessions, totalWeeklyHours };
  };

  const { totalChildren, activeSessions, totalWeeklyHours } = calculateStats();

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Welcome back, {user.firstName}!</h2>
        <p className="text-gray-600 mt-2">Manage your children's tutoring sessions and schedules</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Children</p>
                <p className="text-2xl font-bold text-gray-900">{totalChildren}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{activeSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Weekly Hours</p>
                <p className="text-2xl font-bold text-gray-900">{totalWeeklyHours.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-4">
          <Button onClick={() => router.push("/dashboard/enroll")} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Enroll New Child
          </Button>
          <Button variant="outline" onClick={() => router.push("/dashboard/enrollments")}>
            <BookOpen className="w-4 h-4 mr-2" />
            View All Enrollments
          </Button>
          <Button variant="outline" onClick={() => router.push("/dashboard/payment-history")}>
            <CreditCard className="w-4 h-4 mr-2" />
            Payment History
          </Button>
        </div>
      </div>

      {/* Children Cards */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
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
      ) : children.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Children Enrolled</h3>
            <p className="text-gray-600 mb-6">Get started by enrolling your first child in our tutoring program.</p>
            <Button onClick={() => router.push("/dashboard/enroll")} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Enroll Your First Child
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {children.map((child, index) => {
            const isExpanded = expandedCards.includes(index);
            return (
              <Card key={child.id || index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-14 h-14">
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-semibold">
                          {getInitials(child.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-xl text-gray-900">{child.fullName}</CardTitle>
                        <div className="flex flex-wrap items-center space-x-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {child.serviceDetails.ageLevel}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {child.serviceDetails.serviceType}
                          </Badge>
                          <Badge className={`text-xs ${getStatusColor(child.enrollmentStatus)}`}>
                            {child.enrollmentStatus}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCardExpansion(index)}
                      className="ml-auto hover:bg-gray-100"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Quick Schedule Overview */}
                  <div className="space-y-3">
                    {child.schedule.map((schedule, scheduleIndex) => (
                      <div key={scheduleIndex} className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <BookOpen className="w-4 h-4 text-blue-500" />
                            <span className="font-medium text-gray-900">{schedule.subject}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-green-500" />
                            <span className="text-gray-600">{schedule.days.join(", ")}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-orange-500" />
                            <span className="text-gray-600">
                              {schedule.time} ({schedule.duration} min)
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-6 pt-6 border-t space-y-6">
                      {/* Personal Information */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          Personal Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Gender:</span>
                            <span className="font-medium text-gray-900">{child.gender}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Date of Birth:</span>
                            <span className="font-medium text-gray-900">
                              {new Date(child.dateOfBirth).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Primary Language:</span>
                            <span className="font-medium text-gray-900">{child.primaryLanguage}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Country:</span>
                            <span className="font-medium text-gray-900 flex items-center">
                              <Globe className="w-3 h-3 mr-1" />
                              {child.countryOfResidence}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Parent Information */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          Parent Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Parent Name:</span>
                            <span className="font-medium text-gray-900">{child.parentName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span className="font-medium text-gray-900 flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {child.parentEmail}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Phone:</span>
                            <span className="font-medium text-gray-900 flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {child.parentPhone}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Service Details */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                          <GraduationCap className="w-4 h-4 mr-2" />
                          Service Details
                        </h4>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Learning Focus:</span>
                              <span className="font-medium text-gray-900">{child.serviceDetails.learningFocus}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Preferred Tutor:</span>
                              <span className="font-medium text-gray-900">{child.serviceDetails.tutorGender}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Cost:</span>
                              <span className="font-medium text-gray-900 flex items-center">
                                ₦{child.serviceDetails.totalCost}
                              </span>
                            </div>
                          </div>

                          <div>
                            <span className="text-gray-600 text-sm">Learning Goals:</span>
                            <p className="font-medium text-gray-900 mt-1">{child.serviceDetails.learningGoals}</p>
                          </div>

                          <div>
                            <span className="text-gray-600 text-sm">Selected Subjects:</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {child.serviceDetails.selectedSubjects.map((subject, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {subject}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Detailed Schedule */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          Detailed Schedule
                        </h4>
                        <div className="space-y-3">
                          {child.schedule.map((schedule, scheduleIndex) => (
                            <div key={scheduleIndex} className="border rounded-lg p-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Subject:</span>
                                  <span className="font-medium text-gray-900">{schedule.subject}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Days:</span>
                                  <span className="font-medium text-gray-900 text-right">
                                    {schedule.days.join(", ")}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Time:</span>
                                  <span className="font-medium text-gray-900">{schedule.time}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Duration:</span>
                                  <span className="font-medium text-gray-900">{schedule.duration} minutes</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Weekly Hours:</span>
                                  <span className="font-medium text-gray-900">
                                    {(schedule.days.length * (schedule.duration / 60)).toFixed(1)} hours
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Enroll More Children Button */}
      {children.length > 0 && (
        <div className="mt-8 text-center">
          <Button
            // onClick={() => router.push("/dashboard/select-service")}
            onClick={() => router.push("/dashboard/enroll")}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Enroll More Children
          </Button>
        </div>
      )}
    </main>
  );
}
