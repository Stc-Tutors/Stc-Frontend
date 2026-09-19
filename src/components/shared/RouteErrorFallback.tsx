"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, RotateCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  useEffect(() => {
    console.error(`[RouteErrorBoundary] ${label} crashed:`, error);
  }, [error, label]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-10 text-center min-h-[50vh]">
      <AlertTriangle className="w-10 h-10 text-amber-500" />
      <div>
        <p className="font-medium text-gray-900">Something went wrong loading {label}.</p>
        <p className="text-sm text-gray-500 mt-1">
          This has been logged. You can try again or head back.
        </p>
      </div>
      <div className="flex gap-3">
        <Button onClick={() => reset()}>
          <RotateCw className="w-4 h-4 mr-2" /> Try again
        </Button>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Go back
        </Button>
      </div>
    </div>
  );
}
