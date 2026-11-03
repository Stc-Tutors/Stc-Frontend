"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";
import { unwrap, useCachedQuery } from "@/lib/client-cache";
import { GetNotificationsAction, MarkNotificationReadAction } from "@/server/notification";
import { Notification } from "@/types/notification";

// Path part of a notification link, whether it was stored as a path or as an absolute URL to this site.
function linkPath(link?: string): string | null {
  if (!link) return null;
  try {
    const url = new URL(link, window.location.origin);
    return url.origin === window.location.origin ? url.pathname.replace(/\/+$/, "") : null;
  } catch {
    return null;
  }
}

const within = (path: string, section: string) => path === section || path.startsWith(`${section}/`);

// Unread counts for the sidebar, WhatsApp-style: each menu entry shows how many unread notifications point at a page inside it, and the
// count clears once the person opens that section. Driven by the same cached notification list as the bell, so it costs no extra request
// and updates the moment the server announces a new one.
export function useSectionBadges() {
  const pathname = usePathname();
  const { data, refresh } = useCachedQuery<Notification[]>(
    "notifications",
    async () => (await unwrap(GetNotificationsAction())) ?? [],
    { ttl: 15_000, tags: ["notifications"] }
  );
  const unread = useMemo(() => (data ?? []).filter((n) => !n.read), [data]);
  const total = unread.length;

  const countFor = useCallback(
    (href: string) => unread.reduce((sum, n) => {
      const path = linkPath(n.link);
      return path && within(path, href) ? sum + 1 : sum;
    }, 0),
    [unread]
  );

  // Opening a section reads what was waiting for it. The notifications list itself is left alone - that is where the person reads them.
  const clearingRef = useRef(new Set<string>());
  useEffect(() => {
    if (!pathname || /\/notification(s)?$/.test(pathname)) return;
    const here = pathname.replace(/\/+$/, "");
    const waiting = unread.filter((n) => {
      const path = linkPath(n.link);
      return path && within(path, here) && !clearingRef.current.has(n.id);
    });
    if (waiting.length === 0) return;
    waiting.forEach((n) => clearingRef.current.add(n.id));
    void Promise.all(waiting.slice(0, 30).map((n) => MarkNotificationReadAction(n.id))).then(() => refresh());
  }, [pathname, unread, refresh]);

  return { total, countFor };
}

// The red count pill beside a menu entry (nothing when zero).
export function NavCount({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="ml-auto min-w-5 h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-semibold flex items-center justify-center" aria-label={`${count} unread`}>
      {count > 99 ? "99+" : count}
    </span>
  );
}
