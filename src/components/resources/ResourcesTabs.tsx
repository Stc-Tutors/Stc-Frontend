"use client";

import { useMemo, useState } from "react";
import { Eye, FileText, Lock, Music, PlayCircle, User, Video } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ResourcePreviewDialog from "./ResourcePreviewDialog";
import { CourseResource, ResourceAccessTier, ResourceStatus, ResourceType } from "@/types/resource";

export interface RecordingItem {
  id: string;
  title: string;
  date: string;
  url: string;
  meta?: string;
}

interface ResourcesTabsProps {
  resources: CourseResource[];
  // Omit entirely to hide the "Lesson Recordings" tab.
  recordings?: RecordingItem[];
  // If given, clicking a recording calls this instead of opening the
  // preview dialog (student classroom uses this to drive its hero player).
  onSelectRecording?: (item: RecordingItem) => void;
  // Presence enables the locked/"Unlock for X" row UI for PAID resources
  // the viewer hasn't unlocked yet.
  onUnlock?: (r: CourseResource) => void;
  // Show a Pending/Approved/Rejected pill (tutor + admin views).
  statusBadge?: boolean;
  renderExtraActions?: (r: CourseResource) => React.ReactNode;
  // When length > 1, shows a "Course" filter Select above the list.
  courses?: { id: string; title: string }[];
  emptyMessage?: string;
}

type SortOption = "newest" | "oldest" | "title";

const statusStyles: Record<ResourceStatus, string> = {
  [ResourceStatus.PENDING]: "bg-blue-100 text-blue-600",
  [ResourceStatus.APPROVED]: "bg-green-100 text-green-600",
  [ResourceStatus.REJECTED]: "bg-red-100 text-red-600",
};

const typeIcon: Record<ResourceType, typeof FileText> = {
  [ResourceType.DOCUMENT]: FileText,
  [ResourceType.VIDEO]: Video,
  [ResourceType.AUDIO]: Music,
};

function courseIdOf(course: CourseResource["course"]) {
  return typeof course === "string" ? course : course.id;
}

function courseTitleOf(course: CourseResource["course"]) {
  return typeof course === "string" ? course : course.title;
}

function sortResourceList(list: CourseResource[], sort: SortOption) {
  const copy = [...list];
  if (sort === "newest") copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  else if (sort === "oldest") copy.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  else copy.sort((a, b) => a.title.localeCompare(b.title));
  return copy;
}

function sortRecordingList(list: RecordingItem[], sort: SortOption) {
  const copy = [...list];
  if (sort === "newest") copy.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  else if (sort === "oldest") copy.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  else copy.sort((a, b) => a.title.localeCompare(b.title));
  return copy;
}

export default function ResourcesTabs({
  resources,
  recordings,
  onSelectRecording,
  onUnlock,
  statusBadge,
  renderExtraActions,
  courses,
  emptyMessage = "Nothing here yet.",
}: ResourcesTabsProps) {
  const [sort, setSort] = useState<SortOption>("newest");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [preview, setPreview] = useState<{ title: string; url: string } | null>(null);

  const showRecordings = recordings !== undefined;
  const showCourseFilter = (courses?.length ?? 0) > 1;

  const filteredResources = useMemo(() => {
    if (!showCourseFilter || courseFilter === "all") return resources;
    return resources.filter((r) => courseIdOf(r.course) === courseFilter);
  }, [resources, courseFilter, showCourseFilter]);

  const allResources = useMemo(() => sortResourceList(filteredResources, sort), [filteredResources, sort]);
  const documentResources = useMemo(
    () => allResources.filter((r) => (r.type ?? ResourceType.DOCUMENT) === ResourceType.DOCUMENT),
    [allResources]
  );
  const videoResources = useMemo(
    () => allResources.filter((r) => (r.type ?? ResourceType.DOCUMENT) === ResourceType.VIDEO),
    [allResources]
  );
  const audioResources = useMemo(
    () => allResources.filter((r) => (r.type ?? ResourceType.DOCUMENT) === ResourceType.AUDIO),
    [allResources]
  );
  const sortedRecordings = useMemo(() => sortRecordingList(recordings ?? [], sort), [recordings, sort]);

  const renderResourceRow = (r: CourseResource) => {
    const type = r.type ?? ResourceType.DOCUMENT;
    const Icon = typeIcon[type];
    const isLocked = !!onUnlock && r.accessTier === ResourceAccessTier.PAID && !r.fileUrl;
    return (
      <div key={r.id} className="flex items-center justify-between border-b py-4 last:border-b-0 gap-4">
        <div className="flex items-center gap-4 min-w-0">
          {isLocked ? (
            <Lock className="text-amber-500 shrink-0" size={28} />
          ) : (
            <Icon className="text-blue-500 shrink-0" size={28} />
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-medium text-gray-800 truncate">{r.title}</h4>
              {statusBadge && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${statusStyles[r.status]}`}>
                  {r.status}
                </span>
              )}
              {!!r.students?.length && (
                <span
                  className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full shrink-0 bg-purple-100 text-purple-700"
                  title="Only visible to the students it was targeted to"
                >
                  <User className="w-3 h-3" /> {r.students.length} student{r.students.length === 1 ? "" : "s"}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 truncate">
              {courseTitleOf(r.course)} • {new Date(r.createdAt).toLocaleDateString()}
            </p>
            {renderExtraActions?.(r)}
          </div>
        </div>
        <div className="shrink-0">
          {isLocked ? (
            <button
              onClick={() => onUnlock?.(r)}
              className="text-sm font-medium text-amber-600 hover:text-amber-700 whitespace-nowrap"
            >
              Unlock for {r.currency ?? "NGN"} {r.price ?? 0}
            </button>
          ) : (
            <button
              onClick={() => setPreview({ title: r.title, url: r.fileUrl })}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-500 hover:text-blue-600 whitespace-nowrap"
            >
              <Eye className="w-4 h-4" /> Preview
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderRecordingRow = (item: RecordingItem) => (
    <div
      key={item.id}
      onClick={() => (onSelectRecording ? onSelectRecording(item) : setPreview({ title: item.title, url: item.url }))}
      className="flex items-center justify-between border-b py-4 last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors rounded px-2 -mx-2"
    >
      <div className="flex items-center gap-4 min-w-0">
        <PlayCircle className="text-blue-500 shrink-0" size={28} />
        <div className="min-w-0">
          <h4 className="font-medium text-gray-800 truncate">{item.title}</h4>
          <p className="text-sm text-gray-500 truncate">
            {new Date(item.date).toLocaleDateString()}
            {item.meta ? ` • ${item.meta}` : ""}
          </p>
        </div>
      </div>
    </div>
  );

  const renderEmpty = () => <p className="text-sm text-gray-500 py-6 text-center">{emptyMessage}</p>;

  const toolbar = (
    <div className="flex flex-wrap items-center gap-3 mb-3">
      <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
        <SelectTrigger size="sm" className="w-[160px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest first</SelectItem>
          <SelectItem value="oldest">Oldest first</SelectItem>
          <SelectItem value="title">Title A–Z</SelectItem>
        </SelectContent>
      </Select>
      {showCourseFilter && (
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger size="sm" className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All courses</SelectItem>
            {courses!.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );

  return (
    <div>
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Resources</TabsTrigger>
          {showRecordings && <TabsTrigger value="recordings">Lesson Recordings</TabsTrigger>}
          <TabsTrigger value="document">PDFs &amp; Docs</TabsTrigger>
          <TabsTrigger value="video">Video</TabsTrigger>
          <TabsTrigger value="audio">Audio</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {toolbar}
          <div className="bg-white rounded-lg shadow-sm px-4">
            {allResources.length === 0 ? renderEmpty() : allResources.map(renderResourceRow)}
          </div>
        </TabsContent>

        {showRecordings && (
          <TabsContent value="recordings">
            {toolbar}
            <div className="bg-white rounded-lg shadow-sm px-4">
              {sortedRecordings.length === 0 ? renderEmpty() : sortedRecordings.map(renderRecordingRow)}
            </div>
          </TabsContent>
        )}

        <TabsContent value="document">
          {toolbar}
          <div className="bg-white rounded-lg shadow-sm px-4">
            {documentResources.length === 0 ? renderEmpty() : documentResources.map(renderResourceRow)}
          </div>
        </TabsContent>

        <TabsContent value="video">
          {toolbar}
          <div className="bg-white rounded-lg shadow-sm px-4">
            {videoResources.length === 0 ? renderEmpty() : videoResources.map(renderResourceRow)}
          </div>
        </TabsContent>

        <TabsContent value="audio">
          {toolbar}
          <div className="bg-white rounded-lg shadow-sm px-4">
            {audioResources.length === 0 ? renderEmpty() : audioResources.map(renderResourceRow)}
          </div>
        </TabsContent>
      </Tabs>

      {preview && (
        <ResourcePreviewDialog
          open={!!preview}
          onOpenChange={(open) => !open && setPreview(null)}
          title={preview.title}
          url={preview.url}
        />
      )}
    </div>
  );
}
