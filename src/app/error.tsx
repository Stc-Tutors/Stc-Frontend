"use client";

import RouteErrorFallback from "@/components/shared/RouteErrorFallback";

// Catches any render error below this segment while leaving its layout (sidebar,
// header) on screen - the failure is contained to the page area instead of
// falling through to Next's generic "This page couldn't load".
export default function SegmentError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteErrorFallback error={error} reset={reset} label="this page" />;
}
