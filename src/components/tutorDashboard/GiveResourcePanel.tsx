"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadResourceAction } from "@/server/resource";
import { ResourceType } from "@/types/resource";
import { toGoogleDriveEmbedUrl } from "@/lib/google-drive";

const resourceTypeLabels: Record<ResourceType, string> = {
  [ResourceType.DOCUMENT]: "Document",
  [ResourceType.VIDEO]: "Video",
  [ResourceType.AUDIO]: "Audio",
  [ResourceType.LIVE_RECORDING]: "Live Recording",
};

// Same upload as the tutor's main Resources tab, but pre-targeted at this
// one student (UploadResourceAction's "students" mode needs no course - the
// backend just checks the student is one of this tutor's own, see
// ResourceService.upload) - so no target picker is needed here at all.
export default function GiveResourcePanel({ studentId, onUploaded }: { studentId: string; onUploaded?: () => void }) {
  const [title, setTitle] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [type, setType] = useState<ResourceType>(ResourceType.DOCUMENT);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const driveError = fileUrl.trim() && !toGoogleDriveEmbedUrl(fileUrl) ? "Must be a Google Drive share link" : null;

  const handleUpload = async () => {
    if (!title || !fileUrl || driveError) {
      setMessage(driveError || "Fill in title + file link");
      return;
    }
    setIsSubmitting(true);
    const [, error] = await UploadResourceAction({ title, fileUrl, type, students: [studentId] });
    setIsSubmitting(false);
    setMessage(error || "Uploaded - awaiting admin approval");
    if (!error) {
      setTitle("");
      setFileUrl("");
      setType(ResourceType.DOCUMENT);
      onUploaded?.();
    }
  };

  return (
    <div className="space-y-2">
      {message && <p className="text-sm text-blue-600">{message}</p>}
      <Input placeholder="Title (e.g. Week 3 worksheet)" value={title} onChange={(e) => setTitle(e.target.value)} />
      <div>
        <Input
          placeholder="File link (must be a Google Drive share link)"
          value={fileUrl}
          onChange={(e) => setFileUrl(e.target.value)}
        />
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
        {isSubmitting ? "Uploading..." : "Upload for this student"}
      </Button>
    </div>
  );
}
