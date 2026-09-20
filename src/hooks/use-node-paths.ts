"use client";

import { useEffect, useRef, useState } from "react";
import { GetCurriculumNodeAction } from "@/server/curriculum";

// Resolves tree item ids to their full path, e.g. "Digital Skills › Bundle Courses
// › Tech Product Management" - just a name is ambiguous when two items share one
// (two "Bundle Courses" in different places looked identical in the price list).
// Each node is fetched once and cached; parents are followed up to the root.
export function useNodePaths(ids: string[]): Record<string, string> {
  const cache = useRef<Record<string, { name: string; parent: string | null }>>({});
  const [paths, setPaths] = useState<Record<string, string>>({});
  const key = Array.from(new Set(ids.filter(Boolean))).sort().join(",");

  useEffect(() => {
    const wanted = key ? key.split(",") : [];
    if (wanted.length === 0) return;
    let cancelled = false;

    (async () => {
      const load = async (id: string) => {
        if (id in cache.current) return;
        const [res] = await GetCurriculumNodeAction(id);
        cache.current[id] = res?.data
          ? { name: res.data.name, parent: res.data.parent ?? null }
          : { name: "(removed item)", parent: null };
      };

      const next: Record<string, string> = {};
      for (const id of wanted) {
        const chain: string[] = [];
        let current: string | null = id;
        let guard = 0;
        while (current && guard++ < 8) {
          await load(current);
          chain.unshift(cache.current[current].name);
          current = cache.current[current].parent;
        }
        next[id] = chain.join(" › ");
      }
      if (!cancelled) setPaths((prev) => ({ ...prev, ...next }));
    })();

    return () => {
      cancelled = true;
    };
  }, [key]);

  return paths;
}
