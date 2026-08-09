"use client";

import { useEffect, useState } from "react";
import { GetNotificationsAction } from "@/server/notification";
import { Notification } from "@/types/notification";

export default function AnnouncementFeed() {
  const [items, setItems] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [res] = await GetNotificationsAction();
      setItems((res?.data ?? []).slice(0, 6));
      setIsLoading(false);
    };
    load();
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="font-semibold text-gray-800 mb-3">Announcement</h3>
      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-400">No announcements yet.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((n) => (
            <li key={n.id} className="border-b last:border-none pb-2">
              <p className="text-sm font-medium text-gray-800">{n.title}</p>
              <p className="text-xs text-gray-500">{n.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
