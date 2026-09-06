"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Megaphone } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { GetAnnouncementsAction } from "@/server/announcement";
import { Announcement } from "@/types/announcement";

// Every role's own read-only view of broadcasts addressed to them (see
// stcbe's AnnouncementService.listForRecipient) - before this, a student/
// parent/tutor only ever saw an announcement as a one-line notification
// with nowhere to go read the rest, since AnnouncementFeed/the announcements
// history page were admin-only. Mounted once per role layout, next to the
// notification bell, and deep-linkable via ?announcement=<id> (see
// AnnouncementService.sendToRecipients's default notification link) so
// clicking an "Announcement" notification opens straight to it.
export default function AnnouncementsOverlay() {
  return (
    <Suspense fallback={null}>
      <AnnouncementsOverlayInner />
    </Suspense>
  );
}

function AnnouncementsOverlayInner() {
  const targetId = useSearchParams().get("announcement");
  const [open, setOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [active, setActive] = useState<Announcement | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const load = async () => {
    setIsLoading(true);
    const [res] = await GetAnnouncementsAction();
    setAnnouncements(res?.data ?? []);
    setIsLoading(false);
    setHasLoaded(true);
  };

  // Deep-link from a notification - open straight up, and once the list
  // loads, jump directly to the detail view for that one.
  useEffect(() => {
    if (targetId) setOpen(true);
  }, [targetId]);

  useEffect(() => {
    if (open && !hasLoaded) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!targetId || !hasLoaded) return;
    const found = announcements.find((a) => a.id === targetId);
    if (found) setActive(found);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId, hasLoaded]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setActive(null);
      }}
    >
      <DialogTrigger asChild>
        <button className="relative rounded-full p-2 hover:bg-gray-100 transition" aria-label="Announcements">
          <Megaphone className="size-5 text-gray-600" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {active && (
              <button onClick={() => setActive(null)} className="text-gray-400 hover:text-gray-700" aria-label="Back to list">
                <ArrowLeft className="size-4" />
              </button>
            )}
            {active ? active.title : "Announcements"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          {active ? (
            <div className="space-y-3">
              <p className="text-xs text-gray-400">{new Date(active.createdAt).toLocaleString()}</p>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{active.body}</p>
              {active.link && (
                <a href={active.link} className="text-sm text-blue-600 hover:underline inline-block">
                  Learn more →
                </a>
              )}
            </div>
          ) : isLoading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : announcements.length === 0 ? (
            <p className="text-sm text-gray-500">No announcements yet.</p>
          ) : (
            <div className="divide-y">
              {announcements.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setActive(a)}
                  className="w-full text-left py-3 px-1 -mx-1 rounded hover:bg-gray-50 transition"
                >
                  <p className="font-medium text-sm text-gray-900">{a.title}</p>
                  <p className="text-xs text-gray-500 truncate">{a.body}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{new Date(a.createdAt).toLocaleString()}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
