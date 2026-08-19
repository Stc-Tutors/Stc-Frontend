"use client";

import { usePathname } from "next/navigation";
import BrandLogo from "@/components/shared/BrandLogo";
import { humanizePath } from "@/lib/humanize-path";

// Next.js's loading.tsx convention renders this automatically while a route
// segment (and its data) is still loading - see the loading.tsx file next to
// each layout. BrandLogo already resolves the current tenant's own logo, so
// a white-label deployment gets its own branding here for free.
export default function PageLoader() {
  const pathname = usePathname();
  const pageName = humanizePath(pathname);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-white">
      <div className="animate-heartbeat">
        <BrandLogo width={140} height={46} className="object-contain" />
      </div>
      <p className="text-sm text-gray-500 animate-text-pulse">Loading {pageName}&hellip;</p>
    </div>
  );
}
