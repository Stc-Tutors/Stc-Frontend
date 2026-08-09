"use client";

import { ExternalLink, Video } from "lucide-react";

interface VirtualClassroomFrameProps {
  meetingUrl: string;
}

// Embeds the Admin-provided Google Meet (or similar) link so a class is
// joined without leaving the platform. Some Meet/Workspace configurations
// refuse to render inside an iframe (X-Frame-Options is set by Google, not
// us) - the fallback link below covers that case instead of stranding the user.
export default function VirtualClassroomFrame({ meetingUrl }: VirtualClassroomFrameProps) {
  return (
    <div className="bg-black rounded-lg shadow-md overflow-hidden">
      <div className="w-full aspect-video">
        <iframe
          src={meetingUrl}
          className="w-full h-full border-0"
          allow="camera; microphone; fullscreen; display-capture; autoplay"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="flex items-center justify-between bg-gray-900 text-gray-300 text-xs px-4 py-2">
        <span className="flex items-center gap-2">
          <Video className="w-4 h-4" />
          Virtual Classroom
        </span>
        <a
          href={meetingUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 hover:text-white transition-colors"
        >
          Trouble joining? Open in a new tab
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
