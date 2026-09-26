"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GetRecordingPlaybackAction } from "@/server/live-class";

interface RecordingPlayerDialogProps {
  lessonId: string | null;
  title?: string;
  onClose: () => void;
}

// Plays a class recording. The server hands back a short-lived signed URL to a
// private file each time it's opened - nothing here is a permanent link, and
// download is switched off in the player (a determined viewer can still
// screen-record; this is about not making a copy a single click away).
export default function RecordingPlayerDialog({ lessonId, title, onClose }: RecordingPlayerDialogProps) {
  // The answer is stored together with the lesson it belongs to, so switching
  // to another recording never briefly shows the previous one - and nothing is
  // reset synchronously inside the effect.
  const [result, setResult] = useState<{ lessonId: string; url?: string; error?: string } | null>(null);

  useEffect(() => {
    if (!lessonId) return;
    let cancelled = false;
    (async () => {
      const [res, err] = await GetRecordingPlaybackAction(lessonId);
      if (cancelled) return;
      setResult(
        err || !res?.data ? { lessonId, error: err || "This recording isn't available" } : { lessonId, url: res.data.url }
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  const current = result && result.lessonId === lessonId ? result : null;
  const url = current?.url ?? null;
  const error = current?.error ?? null;

  return (
    <Dialog open={!!lessonId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title || "Class recording"}</DialogTitle>
        </DialogHeader>
        {error ? (
          <p className="py-10 text-center text-sm text-gray-600">{error}</p>
        ) : !url ? (
          <div className="flex items-center justify-center gap-2 py-16 text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading recording...</span>
          </div>
        ) : (
          <video
            src={url}
            controls
            controlsList="nodownload noremoteplayback"
            disablePictureInPicture
            onContextMenu={(e) => e.preventDefault()}
            className="w-full rounded-md bg-black"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
