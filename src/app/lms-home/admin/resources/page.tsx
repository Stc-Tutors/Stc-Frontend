"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GetCoursesAction } from "@/server/course";
import { GetLessonsAdminAction } from "@/server/lesson";
import {
  ApproveResourceAction,
  GetResourcesForAdminAction,
  RejectResourceAction,
  UploadResourceAction,
} from "@/server/resource";
import { Course } from "@/types/course";
import { CourseResource, ResourceStatus, ResourceType } from "@/types/resource";
import ResourcesTabs, { RecordingItem } from "@/components/resources/ResourcesTabs";
import StudentTargetPicker from "@/components/resources/StudentTargetPicker";

const resourceTypeLabels: Record<ResourceType, string> = {
  [ResourceType.DOCUMENT]: "Document",
  [ResourceType.VIDEO]: "Video",
  [ResourceType.AUDIO]: "Audio",
};

// listForAdmin (GET /resources/admin/all) defaults to PENDING when no status
// query param is given - there's no "all statuses" server option, so fetch
// each status and merge to show everything across the tabs.
const ALL_STATUSES = [ResourceStatus.PENDING, ResourceStatus.APPROVED, ResourceStatus.REJECTED];

export default function AdminResourcesPage() {
  const [rows, setRows] = useState<CourseResource[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [recordings, setRecordings] = useState<RecordingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [type, setType] = useState<ResourceType>(ResourceType.DOCUMENT);
  const [targetStudentIds, setTargetStudentIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = async () => {
    setIsLoading(true);
    const [coursesRes] = await GetCoursesAction();
    const allCourses = coursesRes?.data ?? [];
    setCourses(allCourses);
    if (!courseId && allCourses.length) setCourseId(allCourses[0].id);

    const statusResults = await Promise.all(ALL_STATUSES.map((s) => GetResourcesForAdminAction(s)));
    const merged = statusResults.flatMap(([res]) => res?.data ?? []);
    setRows(merged);

    const [lessonsRes] = await GetLessonsAdminAction();
    const courseTitleById = new Map(allCourses.map((c) => [c.id, c.title]));
    const recs: RecordingItem[] = (lessonsRes?.data ?? [])
      .filter((l) => l.recordingUrl)
      .map((l) => {
        const courseRef = typeof l.course === "string" ? courseTitleById.get(l.course) : l.course.title;
        return { id: l.id, title: l.title, date: String(l.scheduledDate), url: l.recordingUrl!, meta: courseRef };
      });
    setRecordings(recs);

    setIsLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpload = async () => {
    if (!courseId || !title || !fileUrl) {
      setMessage("Pick a course and fill in title + file link");
      return;
    }
    setIsSubmitting(true);
    const [, error] = await UploadResourceAction({
      title,
      fileUrl,
      course: courseId,
      type,
      students: targetStudentIds.length ? targetStudentIds : undefined,
    });
    setMessage(error || "Uploaded");
    if (!error) {
      setTitle("");
      setFileUrl("");
      setType(ResourceType.DOCUMENT);
      setTargetStudentIds([]);
      load();
    }
    setIsSubmitting(false);
  };

  const handleApprove = async (id: string) => {
    const [, error] = await ApproveResourceAction(id);
    setMessage(error || "Resource approved");
    load();
  };

  const handleReject = async (id: string) => {
    const [, error] = await RejectResourceAction(id, "Rejected by admin");
    setMessage(error || "Resource rejected");
    load();
  };

  return (
    <div className="bg-white shadow rounded-2xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Resources</h1>

      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
        <h3 className="font-semibold text-gray-800">Upload resource</h3>
        {courses.length === 0 ? (
          <p className="text-sm text-gray-500">No courses available yet.</p>
        ) : (
          <div className="space-y-2">
            <Select
              value={courseId}
              onValueChange={(v) => {
                setCourseId(v);
                setTargetStudentIds([]);
              }}
            >
              <SelectTrigger size="sm" className="w-full sm:w-[240px]">
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input placeholder="File link (Google Drive, Dropbox, ...)" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} />
            <StudentTargetPicker courseId={courseId} value={targetStudentIds} onChange={setTargetStudentIds} />
            <Select value={type} onValueChange={(v) => setType(v as ResourceType)}>
              <SelectTrigger size="sm" className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ResourceType).map((t) => (
                  <SelectItem key={t} value={t}>{resourceTypeLabels[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={handleUpload} disabled={isSubmitting}>
              {isSubmitting ? "Uploading..." : "Upload"}
            </Button>
          </div>
        )}
      </div>

      {message && <p className="text-sm text-blue-600">{message}</p>}

      {isLoading ? (
        <p className="text-sm text-gray-500 py-4">Loading...</p>
      ) : (
        <ResourcesTabs
          resources={rows}
          recordings={recordings}
          statusBadge
          courses={courses.map((c) => ({ id: c.id, title: c.title }))}
          renderExtraActions={(r) =>
            r.status === ResourceStatus.PENDING ? (
              <div className="flex gap-2 mt-1">
                <button onClick={() => handleApprove(r.id)} title="Approve">
                  <Check className="w-4 h-4 text-green-600" />
                </button>
                <button onClick={() => handleReject(r.id)} title="Reject">
                  <X className="w-4 h-4 text-red-600" />
                </button>
              </div>
            ) : undefined
          }
          emptyMessage="No resources to review."
        />
      )}
    </div>
  );
}
