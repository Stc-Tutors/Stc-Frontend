"use client";

import { useEffect, useRef, useState } from "react";
import { unwrap, useCachedQuery } from "@/lib/client-cache";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { GetNotificationsAction, MarkAllNotificationsReadAction, MarkNotificationReadAction } from "@/server/notification";
import { Notification } from "@/types/notification";
import { navigateToNotificationLink } from "@/lib/notification-link";
import { ensureNotificationPermission, playNotificationSound, showBrowserNotification } from "@/lib/notification-alert";

// Live topbar bell (poll + unread badge + preview dropdown), same pattern as
// Stc-SuperAdmin's notification-bell.tsx - replaces the plain static Bell
// icon every /lms-home/* layout used to link straight to the notification
// page with no indication anything had actually happened. Also the only
// thing today giving the general Notification model (as opposed to chat
// messages, see useMessagingSocket) a sound + OS-level popup - see
// notification-alert.ts for why this is poll-driven, not push-driven.
export default function NotificationBell({ viewAllHref }: { viewAllHref: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  // null until the first load resolves, so that load doesn't fire a sound/
  // popup for every notification already sitting there on mount - only for
  // ones that show up in a later refresh.
  const seenIdsRef = useRef<Set<string> | null>(null);

  // Cached and shared, and refetched the moment the server says a notification
  // arrived (the `notifications` invalidation from RealtimeSync) - previously a
  // 30s poll that ran even in a background tab and, since Server Actions run one
  // at a time, sat in the queue in front of whatever the person actually clicked.
  const { data, refresh } = useCachedQuery<Notification[]>(
    "notifications",
    async () => (await unwrap(GetNotificationsAction())) ?? [],
    { ttl: 15_000, tags: ["notifications"] }
  );
  const notifications = data ?? [];

  useEffect(() => {
    ensureNotificationPermission();
  }, []);

  useEffect(() => {
    if (!data) return;
    const seen = seenIdsRef.current;
    if (seen) {
      const fresh = data.filter((n) => !n.read && !seen.has(n.id));
      if (fresh.length > 0) {
        playNotificationSound();
        fresh.slice(0, 3).forEach((n) =>
          showBrowserNotification(n.title, n.body, () => {
            if (n.link) navigateToNotificationLink(router, n.link);
            else router.push(viewAllHref);
          })
        );
      }
    }
    seenIdsRef.current = new Set(data.map((n) => n.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // Safety net for when the realtime socket isn't connected: a slow poll, and
  // only while the tab is actually visible.
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, 60_000);
    return () => clearInterval(interval);
  }, [refresh]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleOpen = (n: Notification) => {
    if (!n.read) MarkNotificationReadAction(n.id).then(() => refresh());
    setIsOpen(false);
    if (n.link) navigateToNotificationLink(router, n.link);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="relative p-2 rounded-full hover:bg-gray-100 cursor-pointer transition"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          <div className="flex items-center justify-between p-3 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-900">Notifications</span>
            <button
              onClick={() => MarkAllNotificationsReadAction().then(() => refresh())}
              className="text-xs text-blue-600 hover:underline"
            >
              Mark all read
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500 p-4">No notifications.</p>
            ) : (
              notifications.slice(0, 8).map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleOpen(n)}
                  className={`w-full text-left p-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 ${n.read ? "" : "bg-blue-50/50"}`}
                >
                  <p className="text-sm font-medium text-gray-900">{n.title}</p>
                  <p className="text-xs text-gray-500 truncate">{n.body}</p>
                </button>
              ))
            )}
          </div>
          <button
            onClick={() => {
              setIsOpen(false);
              router.push(viewAllHref);
            }}
            className="w-full text-center p-2 text-xs text-blue-600 hover:underline border-t border-gray-100"
          >
            View all
          </button>
        </div>
      )}
    </div>
  );
}
