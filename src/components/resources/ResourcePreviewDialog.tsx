"use client";

import { ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getViewerSource, isSafeResourceUrl } from "@/lib/drive-embed";

interface ResourcePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  url: string;
}

// The LMS's in-app document viewer - every "View"/"Preview" surface opens
// this instead of navigating away. Sized for reading (not the old
// video-shaped 16:9 box, which cropped documents).
export default function ResourcePreviewDialog({ open, onOpenChange, title, url }: ResourcePreviewDialogProps) {
  const { kind, src } = getViewerSource(url);
  const canOpenExternally = isSafeResourceUrl(url);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl w-[95vw]">
        <DialogHeader>
          <DialogTitle className="pr-6">{title}</DialogTitle>
        </DialogHeader>
        <div className="h-[70vh] w-full overflow-hidden rounded-md border bg-gray-50 flex items-center justify-center">
          {kind === "image" && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={title} className="max-h-full max-w-full object-contain" />
          )}
          {kind === "video" && <video src={src} controls className="h-full w-full" />}
          {kind === "audio" && <audio src={src} controls className="w-full max-w-xl" />}
          {kind === "frame" && <iframe src={src} title={title} className="h-full w-full border-0" allow="autoplay" />}
          {kind === "blocked" && <p className="text-sm text-gray-500 px-4 text-center">This link can&apos;t be previewed.</p>}
        </div>
        {canOpenExternally && (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            Not displaying? Open in a new tab <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </DialogContent>
    </Dialog>
  );
}
