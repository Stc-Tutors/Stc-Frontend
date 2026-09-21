"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, RotateCw, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// After a deploy, a tab that was open before it still points at JS chunks and
// Server Action ids that no longer exist. Retrying the render can never fix that;
// only loading the new version can.
function isStaleDeploymentError(error: Error): boolean {
  const text = `${error.name} ${error.message}`;
  return /ChunkLoadError|Loading chunk|Failed to fetch dynamically imported module|Failed to find Server Action|Importing a module script failed/i.test(text);
}

// Next.js route-segment error boundaries render this whenever a component
// throws during render/mount anywhere under that segment - without this,
// Next's own fallback is a generic "This page couldn't load" with nothing
// logged, which is what made the dashboard/schedule crashes unreportable.
export default function RouteErrorFallback({
  error,
  reset,
  label = "this page",
}: {
  error: Error & { digest?: string };
  reset: () => void;
  label?: string;
}) {
  const router = useRouter();
  const stale = isStaleDeploymentError(error);

  useEffect(() => {
    console.error(`[RouteErrorBoundary] ${label} crashed:`, error);
  }, [error, label]);

  return (
    <div role="alert" className="flex flex-col items-center justify-center gap-4 p-6 sm:p-10 text-center min-h-[50vh]">
      <AlertTriangle className="w-10 h-10 text-amber-500" aria-hidden />
      <div>
        <p className="font-medium text-gray-900">
          {stale ? "A new version of the app is available." : `Something went wrong loading ${label}.`}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {stale ? "Reload to get the latest version." : "This has been logged. You can try again or head back."}
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {stale ? (
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" /> Reload
          </Button>
        ) : (
          <Button onClick={() => reset()}>
            <RotateCw className="w-4 h-4 mr-2" /> Try again
          </Button>
        )}
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Go back
        </Button>
      </div>
    </div>
  );
}
