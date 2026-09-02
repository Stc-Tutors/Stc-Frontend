"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { GetNotificationsAction, MarkAllNotificationsReadAction, MarkNotificationReadAction } from "@/server/notification";
import { Notification } from "@/types/notification";
import { navigateToNotificationLink } from "@/lib/notification-link";

// Live topbar bell (poll + unread badge + preview dropdown), same pattern as
// Stc-SuperAdmin's notification-bell.tsx - replaces the plain static Bell
// icon every /lms-home/* layout used to link straight to the notification
// page with no indication anything had actually happened.
export default function NotificationBell({ viewAllHref }: { viewAllHref: string }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const load = () => {
    GetNotificationsAction().then(([res]) => setNotifications(res?.data ?? []));
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleOpen = (n: Notification) => {
    if (!n.read) MarkNotificationReadAction(n.id).then(load);
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
              onClick={() => MarkAllNotificationsReadAction().then(load)}
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
