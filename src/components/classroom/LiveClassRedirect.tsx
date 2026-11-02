"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Video } from "lucide-react";
import { RecordLinkJoinAction } from "@/server/live-class";

interface LiveClassRedirectProps {
  lessonId: string;
  meetingUrl: string;
}

// Google Meet refuses to render inside an iframe (X-Frame-Options is set by
// Google, not us - there is no header we control that changes this), so an
// embedded-in-page classroom isn't achievable on the web. This sends the
// current tab straight to the meeting instead of opening a second tab - the
// closest thing to "staying in the platform" that's actually possible here.
// A native mobile app can do better later: a WebView navigating to this same
// URL as its own top-level page isn't subject to the iframe restriction at
// all, since it's not embedding Meet inside another page.
//
// The click is logged first (it clocks the tutor in and marks the student present - the meeting itself is invisible to us). If it cannot be
// logged, nobody is sent off silently: they are told, and can still open the meeting.
export default function LiveClassRedirect({ lessonId, meetingUrl }: LiveClassRedirectProps) {
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let timer: ReturnType<typeof setTimeout>;
    (async () => {
      const [, err] = await RecordLinkJoinAction(lessonId);
      if (err) {
        setError(err);
        return;
      }
      timer = setTimeout(() => {
        window.location.href = meetingUrl;
      }, 800);
    })();
    return () => clearTimeout(timer);
  }, [lessonId, meetingUrl]);

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg py-16 flex flex-col items-center gap-4 text-center">
      <Video className="w-8 h-8 text-blue-500" />
      {error ? (
        <p className="max-w-md text-sm text-red-600">Your join could not be recorded: {error}</p>
      ) : (
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Recording your join and taking you to your live class...</span>
        </div>
      )}
      <a href={meetingUrl} className="text-xs text-blue-600 hover:underline">
        {error ? "Open the class anyway (your attendance will not be recorded)" : "Not redirected? Click here"}
      </a>
    </div>
  );
}
