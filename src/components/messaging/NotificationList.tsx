"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserCircle } from "lucide-react";
import { GetNotificationsAction, MarkAllNotificationsReadAction, MarkNotificationReadAction } from "@/server/notification";
import { Notification, NotificationType } from "@/types/notification";
import { navigateToNotificationLink } from "@/lib/notification-link";

const TYPE_LABELS: Record<NotificationType, string> = {
  [NotificationType.ASSIGNMENT_GRADED]: "Assignment Graded",
  [NotificationType.NEW_SUBMISSION]: "New Submission",
  [NotificationType.NEW_MESSAGE]: "New Message",
  [NotificationType.CLASS_REMINDER]: "Class Reminder",
  [NotificationType.ENROLLMENT_STATUS]: "Enrollment Status",
  [NotificationType.ANNOUNCEMENT]: "Announcement",
  [NotificationType.PAYOUT_STATUS]: "Payout Status",
  [NotificationType.REFERRAL_STATUS]: "Referral Status",
  [NotificationType.CLASS_CONFIRMED]: "Class Confirmed",
  [NotificationType.EVENT_INVITE]: "Event Invite",
};

export default function NotificationList() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [readFilter, setReadFilter] = useState("");

  const load = async () => {
    const [res] = await GetNotificationsAction();
    setNotifications(res?.data ?? []);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleView = async (n: Notification) => {
    if (!n.read) await MarkNotificationReadAction(n.id);
    if (n.link) navigateToNotificationLink(router, n.link);
    else load();
  };

  const handleMarkAllRead = async () => {
    await MarkAllNotificationsReadAction();
    load();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const visibleTypes = Array.from(new Set(notifications.map((n) => n.type)));
  const filtered = notifications.filter((n) => {
    if (typeFilter && n.type !== typeFilter) return false;
    if (readFilter === "unread" && n.read) return false;
    if (readFilter === "read" && !n.read) return false;
    return true;
  });

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Notifications</h2>
        <button className="text-sm text-blue-600 hover:underline" onClick={handleMarkAllRead}>
          Mark all as read
        </button>
      </div>

      <p className="text-gray-500 mb-4">You have {unreadCount} unread notification(s)</p>

      <div className="flex gap-3 mb-6">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="">All types</option>
          {visibleTypes.map((t) => (
            <option key={t} value={t}>
              {TYPE_LABELS[t] ?? t}
            </option>
          ))}
        </select>
        <select
          value={readFilter}
          onChange={(e) => setReadFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="">All</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </select>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : notifications.length === 0 ? (
        <p className="text-sm text-gray-500">No notifications yet.</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-500">No notifications match this filter.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-lg shadow-sm flex justify-between items-center ${
                n.read ? "bg-white" : "bg-blue-50"
              }`}
            >
              <div className="flex items-start gap-4">
                <UserCircle className="text-blue-500" />
                <div>
                  <p className="font-semibold text-gray-800">
                    {n.title} <span className="text-gray-400 text-sm">({new Date(n.createdAt).toLocaleString()})</span>
                  </p>
                  <p className="text-sm text-gray-600">{n.body}</p>
                </div>
              </div>
              <button className="text-blue-600 hover:underline text-sm" onClick={() => handleView(n)}>
                View
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
