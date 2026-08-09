"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Star } from "lucide-react";
import { Circle } from "rc-progress";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { GetCourseAction, GetCourseStudentsAction, GetCourseDemographicsAction, GetCourseDailyActivityAction } from "@/server/course";
import { GetCourseCompletionReportAction } from "@/server/admin";
import { GetTutorRatingSummaryAction } from "@/server/session-feedback";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Course, CourseDailyActivity, CourseDemographics, CourseTutor } from "@/types/course";
import { CourseEnrollment } from "@/types/course-enrollment";
import { Student, studentAvatarUrl } from "@/types/student";
import { TutorRatingSummary } from "@/types/session-feedback";

export default function AdminCourseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [ratingSummary, setRatingSummary] = useState<TutorRatingSummary | null>(null);
  const [demographics, setDemographics] = useState<CourseDemographics | null>(null);
  const [dailyActivity, setDailyActivity] = useState<CourseDailyActivity[]>([]);
  const [completionRate, setCompletionRate] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    const [courseRes] = await GetCourseAction(id as string);
    const [studentsRes] = await GetCourseStudentsAction(id as string);
    setCourse(courseRes?.data ?? null);
    setEnrollments(studentsRes?.data ?? []);

    const tutorId = typeof courseRes?.data?.tutor === "string" ? courseRes.data.tutor : courseRes?.data?.tutor?.id;
    if (tutorId) {
      const [summaryRes] = await GetTutorRatingSummaryAction(tutorId);
      setRatingSummary(summaryRes?.data ?? null);
    }

    const [demoRes] = await GetCourseDemographicsAction(id as string);
    setDemographics(demoRes?.data ?? null);

    const [activityRes] = await GetCourseDailyActivityAction(id as string, 14);
    setDailyActivity(activityRes?.data ?? []);

    const [completionRes] = await GetCourseCompletionReportAction();
    setCompletionRate(completionRes?.data?.find((c) => c.courseId === id)?.rate ?? 0);

    setIsLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (isLoading) return <p className="p-6">Loading...</p>;
  if (!course) return <p className="p-6">Course not found</p>;

  const tutor = course.tutor as CourseTutor;

  return (
    <div className="bg-white shadow rounded-2xl p-6">
      <button
        onClick={() => router.push("/lms-home/admin/video-courses")}
        className="flex items-center text-gray-700 mb-4 hover:text-blue-500"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        <span className="text-sm font-bold">BACK</span>
      </button>

      {course.coverImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={course.coverImageUrl} alt={course.title} className="w-full h-48 object-cover rounded-lg mb-4" />
      )}

      <h1 className="text-2xl font-bold mb-1">{course.title}</h1>
      <div className="flex items-center gap-2 mb-4">
        {typeof course.tutor !== "string" && (
          <Avatar className="h-8 w-8">
            <AvatarImage src={tutor.avatarUrl} alt={tutor.firstName} />
            <AvatarFallback>{tutor.firstName?.[0]}</AvatarFallback>
          </Avatar>
        )}
        <button
          onClick={() => typeof course.tutor !== "string" && router.push(`/lms-home/profile/${tutor.id}`)}
          className="text-gray-600 hover:text-blue-600 hover:underline text-sm"
        >
          {typeof course.tutor === "string"
            ? course.tutor
            : tutor.email
              ? `${tutor.firstName} ${tutor.lastName} (${tutor.email})`
              : `${tutor.firstName} ${tutor.lastName}`}
        </button>
        {ratingSummary && ratingSummary.totalRatings > 0 && (
          <span className="flex items-center gap-1 text-sm text-gray-600">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            {ratingSummary.averageRating.toFixed(1)} ({ratingSummary.totalRatings})
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-6">{course.description}</p>

      <div className="grid grid-cols-3 gap-4 text-sm mb-8">
        <div>
          <p className="font-medium text-gray-700">Status</p>
          <p>{course.status}</p>
        </div>
        <div>
          <p className="font-medium text-gray-700">Price</p>
          <p>{course.currency} {course.price}</p>
        </div>
        <div>
          <p className="font-medium text-gray-700">Category</p>
          <p>{course.category}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 border rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-1">Daily Activity</h3>
          <p className="text-xs text-gray-400 mb-3">New enrollments and attendance marked, last 14 days</p>
          {dailyActivity.length === 0 ? (
            <p className="text-sm text-gray-500">No activity in this window yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dailyActivity}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="newEnrollments" name="New enrollments" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="attendanceMarked" name="Attendance marked" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="border rounded-lg p-4 flex flex-col items-center justify-center gap-2">
          <div className="relative w-28 h-28">
            <Circle percent={completionRate} strokeWidth={8} trailWidth={8} strokeColor="#3b82f6" trailColor="#e5e7eb" />
            <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-gray-800">
              {completionRate}%
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center">Completion Student Rate</p>
          {ratingSummary && ratingSummary.totalRatings > 0 && (
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> Based on {ratingSummary.totalRatings} review
              {ratingSummary.totalRatings === 1 ? "" : "s"}
            </p>
          )}
        </div>
      </div>

      {demographics && demographics.totalStudents > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Age Distribution</h3>
            <div className="space-y-2">
              {demographics.ageDistribution.map((a) => (
                <div key={a.ageLevel} className="flex items-center gap-2 text-sm">
                  <span className="w-28 text-gray-600 truncate">{a.ageLevel}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${a.percent}%` }} />
                  </div>
                  <span className="w-12 text-right text-gray-500">{a.percent}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Geographical Reach</h3>
            <div className="space-y-2">
              {demographics.countryDistribution.map((c) => (
                <div key={c.country} className="flex items-center gap-2 text-sm">
                  <span className="w-28 text-gray-600 truncate">{c.country}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${c.percent}%` }} />
                  </div>
                  <span className="w-12 text-right text-gray-500">{c.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <h2 className="text-lg font-semibold mb-3">Enrolled Students ({enrollments.length})</h2>
      {enrollments.length === 0 ? (
        <p className="text-sm text-gray-500">No students enrolled in this course yet.</p>
      ) : (
        <ul className="divide-y">
          {enrollments.map((e) => {
            const student = e.student as Student;
            return (
              <li key={e.id} className="py-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {typeof e.student !== "string" && (
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={studentAvatarUrl(student.user)} alt={student.fullName} />
                      <AvatarFallback>{student.fullName?.[0]}</AvatarFallback>
                    </Avatar>
                  )}
                  <span>{typeof e.student === "string" ? e.student : student.fullName}</span>
                </div>
                <span className="text-gray-500">{e.status}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
