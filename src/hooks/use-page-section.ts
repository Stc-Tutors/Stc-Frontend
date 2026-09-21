"use client";

import { useMemo, useRef } from "react";
import { GetPageSectionsAction } from "@/server/content";
import { PageSectionKey } from "@/types/content";
import { unwrap, useCachedQuery } from "@/lib/client-cache";

// Admin-managed homepage content (Stc-SuperAdmin's Site Content > Page
// Sections), falling back to `defaults` - the section's current hardcoded
// copy - until an admin has actually edited it, so nothing on the homepage
// goes blank on first deploy.
//
// The homepage mounts a dozen of these, and each used to fire its own copy of
// the identical request - a dozen Server Actions queued one behind another (they
// dispatch one at a time). They now all read one shared, cached list: a single
// request, and instant on every revisit. Content changes rarely, so five
// minutes fresh is plenty.
export function usePageSection<T extends object>(key: PageSectionKey, defaults: T): T {
  // `defaults` is a fresh object literal every render in every caller; keep the
  // first one so the returned value is stable until real content arrives.
  const defaultsRef = useRef(defaults);
  const { data: sections } = useCachedQuery("page-sections", () => unwrap(GetPageSectionsAction()), {
    ttl: 5 * 60_000,
    persist: true,
    tags: ["content"],
  });
  const match = sections?.find((s) => s.sectionKey === key);

  return useMemo(() => {
    if (match?.data && Object.keys(match.data).length > 0) {
      return { ...defaultsRef.current, ...match.data } as T;
    }
    return defaultsRef.current;
  }, [match]);
}
