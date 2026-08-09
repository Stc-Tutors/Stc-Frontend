"use client";

import { useEffect, useState } from "react";
import { FolderUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GetMyCoursesAction } from "@/server/course";
import { GetMyResourcesAction, UploadResourceAction } from "@/server/resource";
import { Course } from "@/types/course";
import { CourseResource, ResourceStatus } from "@/types/resource";

const statusStyles: Record<ResourceStatus, string> = {
  [ResourceStatus.PENDING]: "bg-blue-100 text-blue-600",
  [ResourceStatus.APPROVED]: "bg-green-100 text-green-600",
  [ResourceStatus.REJECTED]: "bg-red-100 text-red-600",
};

export default function TutorResourcesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [resources, setResources] = useState<CourseResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = async () => {
    setIsLoading(true);
    const [coursesRes] = await GetMyCoursesAction();
    const [resourcesRes] = await GetMyResourcesAction();
    setCourses(coursesRes?.data ?? []);
    setResources(resourcesRes?.data ?? []);
    if (!courseId && coursesRes?.data?.length) setCourseId(coursesRes.data[0].id);
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
    const [, error] = await UploadResourceAction({ title, fileUrl, course: courseId });
    setMessage(error || "Uploaded - awaiting admin approval");
    if (!error) {
      setTitle("");
      setFileUrl("");
      load();
    }
    setIsSubmitting(false);
  };

  const courseTitle = (courseRef: CourseResource["course"]) =>
    typeof courseRef === "string" ? courses.find((c) => c.id === courseRef)?.title ?? courseRef : courseRef.title;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FolderUp className="text-blue-500" />
        <h1 className="text-lg font-semibold text-gray-800">Resources</h1>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm space-y-3">
        <h3 className="font-semibold text-gray-800">Upload instructional material</h3>
        <p className="text-xs text-gray-500">
          PDFs, audio, or images for a course you teach. Paste a link to the file (e.g. a Google Drive share link) -
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
              onChange={(e) => setCourseId(e.target.value)}
              className="border border-gray-300 rounded-md p-2 text-sm w-full"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
            <Input placeholder="Title (e.g. Week 3 worksheet)" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input placeholder="File link (Google Drive, Dropbox, ...)" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} />
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
        ) : resources.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">No resources uploaded yet.</p>
        ) : (
          <div className="space-y-2">
            {resources.map((r) => (
              <div key={r.id} className="border-b py-3 text-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{r.title}</p>
                    <p className="text-xs text-gray-500">{courseTitle(r.course)}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[r.status]}`}>
                    {r.status}
                  </span>
                </div>
                {r.status === ResourceStatus.REJECTED && r.rejectionReason && (
                  <p className="text-xs text-red-600 mt-1">Reason: {r.rejectionReason}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
