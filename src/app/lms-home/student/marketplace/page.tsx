"use client";

import MarketplacePage from "@/components/marketplace/MarketplacePage";

// Only reachable by a self-registered adult student (see student/layout.tsx's
// sidebarLinks gating) - a parent-created child login never sees this link
// and can't self-service add enrollments (see stcbe's isParentRegisteredChild).
export default function StudentMarketplacePage() {
  return <MarketplacePage />;
}
