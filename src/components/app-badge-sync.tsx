"use client";

import { useEffect } from "react";
import { unwrap, useCachedQuery } from "@/lib/client-cache";
import { useUser } from "@/contexts/user-context";
import { GetNotificationsAction } from "@/server/notification";
import { Notification } from "@/types/notification";

const PREFIX = /^\(\d+\+?\)\s/;

function UnreadBadge() {
  const { data } = useCachedQuery<Notification[]>(
    "notifications",
    async () => (await unwrap(GetNotificationsAction())) ?? [],
    { ttl: 15_000, tags: ["notifications"] }
  );
  const unread = (data ?? []).filter((n) => !n.read).length;

  // The unread number on the tab title (the taskbar entry of the desktop app reads it from here) and, where the browser supports it,
  // on the installed app's icon.
  useEffect(() => {
    const apply = () => {
      const base = document.title.replace(PREFIX, "");
      const next = unread > 0 ? `(${unread > 99 ? "99+" : unread}) ${base}` : base;
      if (document.title !== next) document.title = next;
    };
    apply();
    const titleEl = document.querySelector("title");
    const observer = titleEl ? new MutationObserver(apply) : null;
    if (titleEl) observer?.observe(titleEl, { childList: true, characterData: true, subtree: true });

    const nav = navigator as Navigator & { setAppBadge?: (n?: number) => Promise<void>; clearAppBadge?: () => Promise<void> };
    try {
      if (unread > 0) void nav.setAppBadge?.(unread);
      else void nav.clearAppBadge?.();
    } catch {
      // badges unsupported here
    }
    return () => observer?.disconnect();
  }, [unread]);

  return null;
}

// Renders nothing - keeps the unread count on the tab title / app icon for a signed-in person.
export default function AppBadgeSync() {
  const { user } = useUser();
  return user ? <UnreadBadge /> : null;
}
