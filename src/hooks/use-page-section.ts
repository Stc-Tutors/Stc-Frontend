"use client";

import { useEffect, useState } from "react";
import { GetPageSectionsAction } from "@/server/content";
import { PageSectionKey } from "@/types/content";

// Admin-managed homepage content (Stc-SuperAdmin's Site Content > Page
// Sections), falling back to `defaults` - the section's current hardcoded
// copy - until an admin has actually edited it, so nothing on the homepage
// goes blank on first deploy.
export function usePageSection<T extends object>(key: PageSectionKey, defaults: T): T {
  const [data, setData] = useState<T>(defaults);

  useEffect(() => {
    GetPageSectionsAction().then(([res]) => {
      const match = res?.data?.find((s) => s.sectionKey === key);
      if (match?.data && Object.keys(match.data).length > 0) {
        setData({ ...defaults, ...match.data } as T);
      }
    });
    // Only re-run if the section key itself changes (never happens per
    // mounted instance) - `defaults` is a fresh object literal every render
    // in every caller, so including it would refetch in a loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return data;
}
