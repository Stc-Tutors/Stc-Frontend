"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserCircle } from "lucide-react";
import { GetNotificationsAction, MarkAllNotificationsReadAction, MarkNotificationReadAction } from "@/server/notification";
import { Notification } from "@/types/notification";

export default function NotificationList() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    if (n.link) router.push(n.link);
    else load();
  };

  const handleMarkAllRead = async () => {
    await MarkAllNotificationsReadAction();
    load();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Notifications</h2>
        <button className="text-sm text-blue-600 hover:underline" onClick={handleMarkAllRead}>
          Mark all as read
        </button>
      </div>

      <p className="text-gray-500 mb-6">You have {unreadCount} unread notification(s)</p>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : notifications.length === 0 ? (
        <p className="text-sm text-gray-500">No notifications yet.</p>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
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
