"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToastError, ToastSuccess } from "@/components/ui/custom/toast";
import { SendAnnouncementAction, GetAnnouncementsAction } from "@/server/announcement";
import { Announcement, AnnouncementAudience } from "@/types/announcement";
import { useUser } from "@/contexts/user-context";
import { AdminPermission } from "@/types/admin-permission";

const AUDIENCE_LABELS: Record<AnnouncementAudience, string> = {
  [AnnouncementAudience.ALL]: "Everyone",
  [AnnouncementAudience.STUDENTS]: "Students",
  [AnnouncementAudience.PARENTS]: "Parents",
  [AnnouncementAudience.TUTORS]: "Tutors",
  [AnnouncementAudience.CUSTOM]: "Custom recipients",
};

export default function AdminAnnouncementsPage() {
  const { hasPermission } = useUser();
  const canManageAnnouncements = hasPermission(AdminPermission.MANAGE_ANNOUNCEMENTS);

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<AnnouncementAudience>(AnnouncementAudience.ALL);
  const [link, setLink] = useState("");

  const load = async () => {
    setIsLoading(true);
    const [res] = await GetAnnouncementsAction();
    setAnnouncements(res?.data ?? []);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      ToastError("Title and body are required");
      return;
    }
    setIsSending(true);
    const [, error] = await SendAnnouncementAction({
      title: title.trim(),
      body: body.trim(),
      audience,
      link: link.trim() || undefined,
    });
    setIsSending(false);
    if (error) {
      ToastError(error);
      return;
    }
    ToastSuccess("Announcement sent");
    setTitle("");
    setBody("");
    setLink("");
    setAudience(AnnouncementAudience.ALL);
    load();
  };

  return (
    <div className="space-y-6">
      {canManageAnnouncements && (
        <div className="bg-white shadow rounded-2xl p-6">
          <h1 className="text-xl font-bold mb-4">Compose Announcement</h1>
          <div className="space-y-3 max-w-xl">
            <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea rows={4} placeholder="Message body" value={body} onChange={(e) => setBody(e.target.value)} />
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value as AnnouncementAudience)}
              className="border rounded-md px-3 py-2 text-sm w-full"
            >
              {Object.values(AnnouncementAudience)
                .filter((a) => a !== AnnouncementAudience.CUSTOM)
                .map((a) => (
                  <option key={a} value={a}>
                    {AUDIENCE_LABELS[a]}
                  </option>
                ))}
            </select>
            <Input
              placeholder="Optional link (e.g. https://...)"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
            <Button onClick={handleSend} disabled={isSending}>
              {isSending ? "Sending..." : "Send Announcement"}
            </Button>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-2xl p-6">
        <h2 className="font-semibold mb-4">History</h2>
        {isLoading ? (
          <p className="text-sm text-gray-500 py-4">Loading...</p>
        ) : announcements.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">No announcements sent yet.</p>
        ) : (
          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-gray-800">{a.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {AUDIENCE_LABELS[a.audience]} &middot; {a.recipientCount} recipient
                      {a.recipientCount === 1 ? "" : "s"} &middot; {new Date(a.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{a.body}</p>
                {a.link && (
                  <a href={a.link} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline mt-2 inline-block">
                    {a.link}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
