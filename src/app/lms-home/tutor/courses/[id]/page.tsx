"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import JoinClassLink from "@/components/classroom/JoinClassLink";
import { ArrowLeft, Star, Upload } from "lucide-react";
import { Circle } from "rc-progress";
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  GetCourseAction,
  GetCourseDailyActivityAction,
  GetCourseDemographicsAction,
  GetCourseStudentsAction,
  PublishCourseAction,
} from "@/server/course";
import { GetCourseLessonsAction } from "@/server/lesson";
import { GetCourseAssignmentsAction, CreateAssignmentAction } from "@/server/assignment";
import { GetCourseRatingSummaryAction } from "@/server/session-feedback";
import { GetResourcesByCourseAction, UploadResourceAction } from "@/server/resource";
import { Course, CourseDailyActivity, CourseDemographics, CourseStatus } from "@/types/course";
import { Lesson, LessonStatus } from "@/types/lesson";
import { Assignment, AssignmentStatus } from "@/types/assignment";
import { CourseEnrollment } from "@/types/course-enrollment";
import { CourseRatingSummary } from "@/types/session-feedback";
import { CourseResource } from "@/types/resource";

export default function TutorCourseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const courseId = id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [dailyActivity, setDailyActivity] = useState<CourseDailyActivity[]>([]);
  const [demographics, setDemographics] = useState<CourseDemographics | null>(null);
  const [ratingSummary, setRatingSummary] = useState<CourseRatingSummary | null>(null);
  const [resources, setResources] = useState<CourseResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentDescription, setAssignmentDescription] = useState("");
  const [assignmentDueDate, setAssignmentDueDate] = useState("");
  const [assignmentMaxScore, setAssignmentMaxScore] = useState("100");

  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");
  const [isUploadingResource, setIsUploadingResource] = useState(false);

  const load = async () => {
    setIsLoading(true);
    const [courseRes] = await GetCourseAction(courseId);
    const [lessonsRes] = await GetCourseLessonsAction(courseId);
    const [assignmentsRes] = await GetCourseAssignmentsAction(courseId);
    const [studentsRes] = await GetCourseStudentsAction(courseId);
    const [activityRes] = await GetCourseDailyActivityAction(courseId);
    const [demographicsRes] = await GetCourseDemographicsAction(courseId);
    const [ratingRes] = await GetCourseRatingSummaryAction(courseId);
    const [resourcesRes] = await GetResourcesByCourseAction(courseId);
    setCourse(courseRes?.data ?? null);
    setLessons(lessonsRes?.data ?? []);
    setAssignments(assignmentsRes?.data ?? []);
    setEnrollments(studentsRes?.data ?? []);
    setDailyActivity(activityRes?.data ?? []);
    setDemographics(demographicsRes?.data ?? null);
    setRatingSummary(ratingRes?.data ?? null);
    setResources(resourcesRes?.data ?? []);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const handlePublish = async () => {
    const [, error] = await PublishCourseAction(courseId);
    setMessage(error || "Course published");
    load();
  };

  const handleAddAssignment = async () => {
    if (!assignmentTitle || !assignmentDescription || !assignmentDueDate) {
      setMessage("Title, description and due date are required");
      return;
    }
    const [, error] = await CreateAssignmentAction({
      course: courseId,
      title: assignmentTitle,
      description: assignmentDescription,
      dueDate: new Date(assignmentDueDate).toISOString(),
      maxScore: Number(assignmentMaxScore) || 100,
    });
    setMessage(error || "Assignment added");
    setAssignmentTitle("");
    setAssignmentDescription("");
    setAssignmentDueDate("");
    load();
  };

  const handleUploadResource = async () => {
    if (!resourceTitle || !resourceUrl) {
      setMessage("Resource title and file URL are required");
      return;
    }
    setIsUploadingResource(true);
    const [, error] = await UploadResourceAction({ title: resourceTitle, fileUrl: resourceUrl, course: courseId });
    setIsUploadingResource(false);
    setMessage(error || "Resource submitted for admin approval");
    setResourceTitle("");
    setResourceUrl("");
    load();
  };

  if (isLoading) return <p className="p-6">Loading...</p>;
  if (!course) return <p className="p-6">Course not found</p>;

  const completionRate =
    lessons.length > 0 ? Math.round((lessons.filter((l) => l.status === LessonStatus.COMPLETED).length / lessons.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push("/lms-home/tutor/analytics")}
        className="flex items-center text-gray-700 hover:text-blue-500"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        <span className="text-sm font-bold">BACK</span>
      </button>

      {message && <p className="text-sm text-blue-600">{message}</p>}

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="relative">
          {course.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={course.coverImageUrl} alt={course.title} className="w-full h-48 object-cover" />
          ) : (
            <div className="w-full h-48 bg-gray-100" />
          )}
        </div>
        <div className="p-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{course.title}</h1>
            <p className="text-sm text-gray-500">
              {course.category} · {enrollments.length} students · {course.status}
            </p>
          </div>
          {course.status !== CourseStatus.PUBLISHED && <Button onClick={handlePublish}>Publish</Button>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow p-6">
          <h2 className="font-semibold mb-4">Daily Activity</h2>
          {dailyActivity.length === 0 ? (
            <p className="text-sm text-gray-500">No activity recorded yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="newEnrollments" name="New enrollments" fill="#38b6ff" radius={[3, 3, 0, 0]} />
                <Bar dataKey="attendanceMarked" name="Attendance marked" fill="#22c55e" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center justify-center gap-2">
          <p className="text-sm font-medium text-gray-600">Completion Student Rate</p>
          <div className="relative w-28 h-28">
            <Circle percent={completionRate} strokeWidth={8} trailWidth={8} strokeColor="#38b6ff" trailColor="#e5e7eb" />
            <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-gray-800">
              {completionRate}%
            </div>
          </div>
          <p className="text-xs text-gray-400">Based on lessons completed</p>

          {ratingSummary && (
            <div className="w-full border-t mt-3 pt-3 space-y-1.5">
              <div className="flex items-center justify-center gap-1 text-sm font-medium text-gray-800">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {ratingSummary.averageRating || "-"}
                <span className="text-xs text-gray-400 font-normal">({ratingSummary.totalRatings} reviews)</span>
              </div>
              {(["5", "4", "3", "2", "1"] as const).map((star) => {
                const count = ratingSummary.breakdown[star] ?? 0;
                const pct = ratingSummary.totalRatings > 0 ? (count / ratingSummary.totalRatings) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="w-3 text-gray-500">{star}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                      <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {demographics && demographics.totalStudents > 0 && (
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-semibold mb-4">Demographics Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Age Distribution</p>
              <div className="space-y-1.5">
                {demographics.ageDistribution.map((a) => (
                  <div key={a.ageLevel} className="flex items-center gap-2 text-xs">
                    <span className="w-24 text-gray-500 truncate">{a.ageLevel}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${a.percent}%` }} />
                    </div>
                    <span className="w-10 text-right text-gray-500">{a.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Geographical Reach</p>
              <div className="space-y-1.5">
                {demographics.countryDistribution.map((c) => (
                  <div key={c.country} className="flex items-center gap-2 text-xs">
                    <span className="w-24 text-gray-500 truncate">{c.country}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${c.percent}%` }} />
                    </div>
                    <span className="w-10 text-right text-gray-500">{c.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-semibold mb-4">Lessons</h2>
          <div className="space-y-2 mb-4">
            {lessons.length === 0 ? (
              <p className="text-sm text-gray-500">No lessons scheduled yet.</p>
            ) : (
              lessons.map((l) => (
                <div key={l.id} className="flex justify-between items-center text-sm border-b pb-2">
                  <span>{l.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">{new Date(l.scheduledDate).toLocaleString()}</span>
                    {l.meetingUrl && l.status === LessonStatus.SCHEDULED && (
                      <JoinClassLink
                        lessonId={l.id}
                        scheduledDate={l.scheduledDate}
                        durationMinutes={l.durationMinutes}
                        className="text-blue-600 hover:underline text-xs"
                        label="Link"
                      />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          <p className="text-xs text-gray-400">
            Lessons are scheduled automatically once an admin allocates you to a student, including the meeting link.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="font-semibold mb-4">Assignments</h2>
          <div className="space-y-2 mb-4">
            {assignments.length === 0 ? (
              <p className="text-sm text-gray-500">No assignments yet.</p>
            ) : (
              assignments.map((a) => (
                <div key={a.id} className="flex items-center justify-between text-sm border-b pb-2">
                  <span className="flex items-center gap-2">
                    <button
                      className="text-blue-600 hover:underline text-left"
                      onClick={() => router.push(`/lms-home/tutor/courses/${courseId}/assignments/${a.id}`)}
                    >
                      {a.title}
                    </button>
                    {a.status === AssignmentStatus.PENDING_APPROVAL && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-800">
                        Awaiting admin approval
                      </span>
                    )}
                    {a.status === AssignmentStatus.REJECTED && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700"
                        title={a.rejectionReason}
                      >
                        Rejected
                      </span>
                    )}
                  </span>
                  <span className="text-gray-500">Due {new Date(a.dueDate).toLocaleDateString()}</span>
                </div>
              ))
            )}
          </div>
          <div className="space-y-2">
            <Input
              placeholder="Assignment title"
              value={assignmentTitle}
              onChange={(e) => setAssignmentTitle(e.target.value)}
            />
            <Textarea
              placeholder="Description"
              value={assignmentDescription}
              onChange={(e) => setAssignmentDescription(e.target.value)}
            />
            <div className="flex gap-2">
              <Input
                type="date"
                value={assignmentDueDate}
                onChange={(e) => setAssignmentDueDate(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Max score"
                className="w-28"
                value={assignmentMaxScore}
                onChange={(e) => setAssignmentMaxScore(e.target.value)}
              />
            </div>
            <Button size="sm" onClick={handleAddAssignment}>
              Add Assignment
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="font-semibold mb-4">Resources</h2>
        <div className="space-y-2 mb-4">
          {resources.length === 0 ? (
            <p className="text-sm text-gray-500">No resources uploaded yet.</p>
          ) : (
            resources.map((r) => (
              <div key={r.id} className="flex items-center justify-between text-sm border-b pb-2">
                <a href={r.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                  {r.title}
                </a>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    r.status === "APPROVED"
                      ? "bg-emerald-50 text-emerald-700"
                      : r.status === "REJECTED"
                      ? "bg-red-50 text-red-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {r.status === "PENDING" ? "Awaiting admin approval" : r.status}
                </span>
              </div>
            ))
          )}
        </div>
        <div className="flex gap-2">
          <Input placeholder="Resource title (e.g. Formula Sheet)" value={resourceTitle} onChange={(e) => setResourceTitle(e.target.value)} />
          <Input placeholder="File URL" value={resourceUrl} onChange={(e) => setResourceUrl(e.target.value)} />
          <Button size="sm" onClick={handleUploadResource} disabled={isUploadingResource}>
            <Upload className="w-4 h-4 mr-1" /> {isUploadingResource ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>
    </div>
  );
}
