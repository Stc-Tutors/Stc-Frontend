"use client";

import { useEffect, useState } from "react";
import { FolderUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GetMyCoursesAction, GetMyCourseStudentsAction } from "@/server/course";
import { GetCourseLessonsAction } from "@/server/lesson";
import { GetMyResourcesAction, UploadResourceAction } from "@/server/resource";
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

export default function TutorResourcesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [resources, setResources] = useState<CourseResource[]>([]);
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
    const [coursesRes] = await GetMyCoursesAction();
    const [resourcesRes] = await GetMyResourcesAction();
    const myCourses = coursesRes?.data ?? [];
    setCourses(myCourses);
    setResources(resourcesRes?.data ?? []);
    if (!target.course && myCourses.length) setTarget((t) => (t.mode === "course" ? { ...t, course: myCourses[0].id } : t));

    const lessonLists = await Promise.all(myCourses.map((c) => GetCourseLessonsAction(c.id)));
    const allRecordings: RecordingItem[] = [];
    lessonLists.forEach(([res], idx) => {
      (res?.data ?? [])
        .filter((l) => l.recordingUrl)
        .forEach((l) =>
          allRecordings.push({
            id: l.id,
            title: l.title,
            date: String(l.scheduledDate),
            url: l.recordingUrl!,
            meta: myCourses[idx]?.title,
          })
        );
    });
    setRecordings(allRecordings);

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
      ? "Pick a subject you teach"
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
    setMessage(error || "Uploaded - awaiting admin approval");
    if (!error) {
      setTitle("");
      setFileUrl("");
      setType(ResourceType.DOCUMENT);
      setTarget(EMPTY_TARGET);
      load();
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FolderUp className="text-blue-500" />
        <h1 className="text-lg font-semibold text-gray-800">Resources</h1>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm space-y-3">
        <h3 className="font-semibold text-gray-800">Upload instructional material</h3>
        <p className="text-xs text-gray-500">
          PDFs, audio, video, or a live-session recording - target it to a course, a whole subject you teach, or
          specific students. Paste a Google Drive share link; it stays hidden from students until an admin approves
          it.
        </p>
        {message && <p className="text-sm text-blue-600">{message}</p>}

        {courses.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-sm text-amber-800">
            <p className="font-semibold">No students yet - nothing to upload for</p>
            <p className="mt-1">
              The upload form (and its target picker) only appears once you&apos;ve accepted at least one student
              assignment - accepting is what creates the course this resource would be attached to. Once you accept
              an assignment from your dashboard, this form will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <ResourceTargetPicker
              courses={courses}
              fetchStudents={async () => {
                const [res] = await GetMyCourseStudentsAction();
                return res?.data ?? [];
              }}
              value={target}
              onChange={setTarget}
            />
            <Input placeholder="Title (e.g. Week 3 worksheet)" value={title} onChange={(e) => setTitle(e.target.value)} />
            <div>
              <Input placeholder="File link (must be a Google Drive share link)" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} />
              {driveError && <p className="text-xs text-red-600 mt-1">{driveError}</p>}
            </div>
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

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4">Your uploads</h3>
        {isLoading ? (
          <p className="text-sm text-gray-500 py-4">Loading...</p>
        ) : (
          <ResourcesTabs
            resources={resources}
            recordings={recordings}
            statusBadge
            courses={courses.map((c) => ({ id: c.id, title: c.title }))}
            renderExtraActions={(r) =>
              r.status === ResourceStatus.REJECTED && r.rejectionReason ? (
                <p className="text-xs text-red-600 mt-1">Reason: {r.rejectionReason}</p>
              ) : undefined
            }
            emptyMessage="No resources uploaded yet."
          />
        )}
      </div>
    </div>
  );
}
