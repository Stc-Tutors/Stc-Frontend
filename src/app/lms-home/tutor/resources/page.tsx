"use client";

import { useEffect, useState } from "react";
import { FolderUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GetMyCoursesAction } from "@/server/course";
import { GetCourseLessonsAction } from "@/server/lesson";
import { GetMyResourcesAction, UploadResourceAction } from "@/server/resource";
import { Course } from "@/types/course";
import { CourseResource, ResourceStatus, ResourceType } from "@/types/resource";
import ResourcesTabs, { RecordingItem } from "@/components/resources/ResourcesTabs";
import StudentTargetPicker from "@/components/resources/StudentTargetPicker";

const resourceTypeLabels: Record<ResourceType, string> = {
  [ResourceType.DOCUMENT]: "Document",
  [ResourceType.VIDEO]: "Video",
  [ResourceType.AUDIO]: "Audio",
};

export default function TutorResourcesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [resources, setResources] = useState<CourseResource[]>([]);
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
    const [coursesRes] = await GetMyCoursesAction();
    const [resourcesRes] = await GetMyResourcesAction();
    const myCourses = coursesRes?.data ?? [];
    setCourses(myCourses);
    setResources(resourcesRes?.data ?? []);
    if (!courseId && myCourses.length) setCourseId(myCourses[0].id);

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
    setMessage(error || "Uploaded - awaiting admin approval");
    if (!error) {
      setTitle("");
      setFileUrl("");
      setType(ResourceType.DOCUMENT);
      setTargetStudentIds([]);
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
          PDFs, audio, or video for a course you teach. Paste a link to the file (e.g. a Google Drive share link) -
          it stays hidden from students until an admin approves it.
        </p>
        {message && <p className="text-sm text-blue-600">{message}</p>}

        {courses.length === 0 ? (
          <p className="text-sm text-gray-500">
            You aren&apos;t assigned to any courses yet. An admin needs to assign you to a course before you can
            upload resources for it.
          </p>
        ) : (
          <div className="space-y-2">
            <select
              value={courseId}
              onChange={(e) => {
                setCourseId(e.target.value);
                setTargetStudentIds([]);
              }}
              className="border border-gray-300 rounded-md p-2 text-sm w-full"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
            <Input placeholder="Title (e.g. Week 3 worksheet)" value={title} onChange={(e) => setTitle(e.target.value)} />
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
