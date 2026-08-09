"use client";

import { ShieldAlert } from "lucide-react";
import { useEffect, useRef } from "react";

interface SecureVideoPlayerProps {
  url: string;
}

// Best-effort, client-side deterrents only - not real DRM. A determined
// user can still screen-record. The one control that actually matters is
// the Google Drive file's own sharing permission ("Viewers/commenters
// can't download, print, or copy"), which the uploader sets outside this app.
function blockedKey(e: KeyboardEvent) {
  const key = e.key.toLowerCase();
  const blocksDevtools = key === "f12" || (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(key));
  const blocksSaveOrView = e.ctrlKey && ["s", "u"].includes(key);
  if (blocksDevtools || blocksSaveOrView) {
    e.preventDefault();
    e.stopPropagation();
  }
}

function extractDriveFileId(url: string): string | null {
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/?#]+)/);
  if (fileMatch) return fileMatch[1];
  const idParamMatch = url.match(/[?&]id=([^&#]+)/);
  if (idParamMatch) return idParamMatch[1];
  return null;
}

export default function SecureVideoPlayer({ url }: SecureVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.addEventListener("keydown", blockedKey, true);
    return () => document.removeEventListener("keydown", blockedKey, true);
  }, []);

  const driveFileId = extractDriveFileId(url);
  const embedSrc = driveFileId ? `https://drive.google.com/file/d/${driveFileId}/preview` : null;

  return (
    <div>
      <div
        ref={containerRef}
        onContextMenu={(e) => e.preventDefault()}
        className="aspect-video bg-black select-none"
      >
        {embedSrc ? (
          <iframe
            src={embedSrc}
            className="w-full h-full border-0"
            allow="autoplay"
            sandbox="allow-scripts allow-same-origin allow-presentation"
          />
        ) : (
          <video
            className="w-full h-full object-cover"
            controls
            controlsList="nodownload noremoteplayback"
            disablePictureInPicture
            onContextMenu={(e) => e.preventDefault()}
            src={url}
          >
            Your browser does not support the video tag.
          </video>
        )}
      </div>
      <p className="flex items-center gap-1.5 text-xs text-gray-400 px-1 py-2">
        <ShieldAlert className="w-3.5 h-3.5" />
        View-only - downloading and screen capture of this recording are not permitted.
      </p>
    </div>
  );
}
