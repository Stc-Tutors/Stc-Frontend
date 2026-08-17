"use client";

import { useEffect } from "react";
import { Loader2, Video } from "lucide-react";

interface LiveClassRedirectProps {
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
export default function LiveClassRedirect({ meetingUrl }: LiveClassRedirectProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = meetingUrl;
    }, 1200);
    return () => clearTimeout(timer);
  }, [meetingUrl]);

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg py-16 flex flex-col items-center gap-4 text-center">
      <Video className="w-8 h-8 text-blue-500" />
      <div className="flex items-center gap-2 text-gray-600">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Taking you to your live class...</span>
      </div>
      <a href={meetingUrl} className="text-xs text-blue-600 hover:underline">
        Not redirected? Click here
      </a>
    </div>
  );
}
