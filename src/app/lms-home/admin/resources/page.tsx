"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GetCoursesAction } from "@/server/course";
import { GetLessonsAdminAction } from "@/server/lesson";
import { ListStudentsForAdminAction } from "@/server/admin";
import { GetServicesAction } from "@/server/service-catalog";
import {
  ApproveResourceAction,
  GetResourcesForAdminAction,
  RejectResourceAction,
  UploadResourceAction,
} from "@/server/resource";
import { Course } from "@/types/course";
import { CourseResource, ResourceStatus, ResourceType } from "@/types/resource";
import ResourcesTabs, { RecordingItem } from "@/components/resources/ResourcesTabs";
import ResourceTargetPicker, { EMPTY_TARGET, TargetValue } from "@/components/resources/ResourceTargetPicker";
import { toGoogleDriveEmbedUrl } from "@/lib/google-drive";

const resourceTypeLabels: Record<ResourceType, string> = {
  [ResourceType.DOCUMENT]: "Document",
  [ResourceType.VIDEO]: "Video",
  [ResourceType.AUDIO]: "Audio",
  [ResourceType.LIVE_RECORDING]: "Live Recording",
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

  const [target, setTarget] = useState<TargetValue>(EMPTY_TARGET);
  const [title, setTitle] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [type, setType] = useState<ResourceType>(ResourceType.DOCUMENT);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = async () => {
    setIsLoading(true);
    const [coursesRes] = await GetCoursesAction();
    const allCourses = coursesRes?.data ?? [];
    setCourses(allCourses);
    if (!target.course && allCourses.length) setTarget((t) => (t.mode === "course" ? { ...t, course: allCourses[0].id } : t));

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

  const driveError = fileUrl.trim() && !toGoogleDriveEmbedUrl(fileUrl) ? "Must be a Google Drive share link" : null;
  const targetError =
    target.mode === "course" && !target.course
      ? "Pick a course"
      : target.mode === "subject" && (!target.subject || !target.serviceType)
      ? "Pick a service and subject"
      : target.mode === "students" && target.students.length === 0
      ? "Pick at least one student"
      : null;

  const handleUpload = async () => {
    if (!title || !fileUrl || driveError || targetError) {
      setMessage(driveError || targetError || "Fill in title + file link");
      return;
    }
    setIsSubmitting(true);
    const [, error] = await UploadResourceAction({
      title,
      fileUrl,
      type,
      course: target.mode === "course" ? target.course : undefined,
      subject: target.mode === "subject" ? target.subject : undefined,
      serviceType: target.mode === "subject" ? target.serviceType : undefined,
      students: target.mode === "students" ? target.students : undefined,
    });
    setMessage(error || "Uploaded");
    if (!error) {
      setTitle("");
      setFileUrl("");
      setType(ResourceType.DOCUMENT);
      setTarget(EMPTY_TARGET);
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
        <div className="space-y-2">
          <ResourceTargetPicker
            courses={courses}
            fetchStudents={async () => {
              const [res] = await ListStudentsForAdminAction({ limit: 200 });
              return (res?.data ?? []).map((s) => ({ id: s.id, fullName: s.fullName }));
            }}
            fetchServices={async () => {
              const [res] = await GetServicesAction();
              return (res?.data ?? []).map((s) => ({ slug: s.slug, serviceName: s.serviceName }));
            }}
            value={target}
            onChange={setTarget}
          />
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <div>
            <Input placeholder="File link (must be a Google Drive share link)" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} />
            {driveError && <p className="text-xs text-red-600 mt-1">{driveError}</p>}
          </div>
          <div className="space-y-2">
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
        </div>
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
