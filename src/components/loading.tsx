"use client";

import { usePathname } from "next/navigation";
import BrandLogo from "@/components/shared/BrandLogo";
import { humanizePath } from "@/lib/humanize-path";

// Inline Suspense-fallback/loading-state variant of PageLoader - same
// heartbeat logo animation, but sized to sit inside an existing layout
// (e.g. under DashboardHeader) rather than assume it owns the full viewport.
const Loader = () => {
  const pathname = usePathname();
  const pageName = humanizePath(pathname);

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 min-h-[50vh]">
      <div className="animate-heartbeat">
        <BrandLogo width={120} height={40} className="object-contain" />
      </div>
      <p className="text-sm text-gray-500 animate-text-pulse">Loading {pageName}&hellip;</p>
    </div>
  );
};

export default Loader;
