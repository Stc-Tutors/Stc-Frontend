"use client";

import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { GetMyEventsAction } from "@/server/event";
import { EventCategory, PlatformEvent } from "@/types/event";

const CATEGORY_COLORS: Record<EventCategory, string> = {
  [EventCategory.SESSION]: "bg-blue-500",
  [EventCategory.MEETING]: "bg-purple-500",
  [EventCategory.EXAM]: "bg-red-500",
  [EventCategory.DEADLINE]: "bg-amber-500",
  [EventCategory.ACTIVITY]: "bg-emerald-500",
  [EventCategory.OTHER]: "bg-gray-400",
};

// Shared across student/tutor/parent dashboards - shows whatever admin has
// scheduled (sessions, meetings, exams, deadlines, activities) that's
// relevant to the signed-in user, backed by the platform-wide Event module.
export default function UpcomingEventsWidget() {
  const [events, setEvents] = useState<PlatformEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const from = new Date();
      const to = new Date(from.getTime() + 14 * 24 * 60 * 60 * 1000);
      const [res] = await GetMyEventsAction(from.toISOString(), to.toISOString());
      setEvents((res?.data ?? []).slice(0, 5));
      setIsLoading(false);
    };
    load();
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <CalendarDays className="w-4 h-4 text-blue-500" />
        <h3 className="text-sm font-semibold text-gray-800">Upcoming Events</h3>
      </div>
      {isLoading ? (
        <p className="text-xs text-gray-400">Loading...</p>
      ) : events.length === 0 ? (
        <p className="text-xs text-gray-400">Nothing scheduled in the next two weeks.</p>
      ) : (
        <ul className="space-y-2.5">
          {events.map((e) => (
            <li key={e.id} className="flex items-start gap-2 text-sm">
              <span className={`mt-1 size-1.5 rounded-full shrink-0 ${CATEGORY_COLORS[e.category]}`} />
              <div className="min-w-0">
                <p className="text-gray-800 font-medium truncate">{e.title}</p>
                <p className="text-xs text-gray-400">
                  {new Date(e.startDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })} ·{" "}
                  {new Date(e.startDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  {e.location ? ` · ${e.location}` : ""}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
