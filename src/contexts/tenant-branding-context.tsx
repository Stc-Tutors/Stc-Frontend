"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { unwrap, useCachedQuery } from "@/lib/client-cache";
import { GetTenantAction, type TenantInfo } from "@/server/tenant";

type TenantBrandingContextType = {
  tenant: TenantInfo | null;
  isLoading: boolean;
};

const TenantBrandingContext = createContext<TenantBrandingContextType | undefined>(undefined);

function applyFavicon(url: string) {
  let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = url;
}

// Re-skins this app for whichever white-label company it's currently serving
// - resolved server-side from the request's Origin (see stcbe's
// tenant-origin.middleware.ts), so STC's own deployment is unaffected
// (empty branding = every fallback below is a no-op) and a second company's
// deployment gets its own name/logo/colors automatically once their Tenant
// record has branding set.
export function TenantBrandingProvider({ children }: { children: ReactNode }) {
  // Every page load used to start with this request - queued FIRST, so on a
  // phone it held up the session and everything else behind it (Server Actions
  // run one at a time). Branding almost never changes, so it is cached (kept for
  // the tab, revalidated in the background) and a return visit paints the
  // right logo/colours immediately instead of flashing the default ones.
  const { data: tenant = null, isLoading } = useCachedQuery("tenant", () => unwrap(GetTenantAction()), {
    ttl: 10 * 60_000,
    persist: true,
  });

  useEffect(() => {
    const branding = tenant?.branding;
    if (!branding) return;

    if (branding.primaryColor) {
      document.documentElement.style.setProperty("--color-primary", branding.primaryColor);
      document.documentElement.style.setProperty("--primary", branding.primaryColor);
    }
    if (branding.faviconUrl) {
      applyFavicon(branding.faviconUrl);
    }
    if (branding.displayName) {
      document.title = document.title.replace(/STC Tutors/i, branding.displayName);
    }
  }, [tenant]);

  return <TenantBrandingContext.Provider value={{ tenant, isLoading }}>{children}</TenantBrandingContext.Provider>;
}

export function useTenantBranding() {
  const context = useContext(TenantBrandingContext);
  if (context === undefined) {
    throw new Error("useTenantBranding must be used within a TenantBrandingProvider");
  }
  return context;
}
