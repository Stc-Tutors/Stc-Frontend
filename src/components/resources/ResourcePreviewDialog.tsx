"use client";

import { ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getEmbeddableUrl } from "@/lib/drive-embed";

interface ResourcePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  url: string;
}

export default function ResourcePreviewDialog({ open, onOpenChange, title, url }: ResourcePreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="pr-6">{title}</DialogTitle>
        </DialogHeader>
        <iframe src={getEmbeddableUrl(url)} className="w-full aspect-video border-0 rounded-md" allow="autoplay" />
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-600 transition-colors"
        >
          Open in Google Drive <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </DialogContent>
    </Dialog>
  );
}
