"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToastError, ToastSuccess } from "@/components/ui/custom/toast";
import { formatScheduleDateTime } from "@/lib/datetime";
import { DeleteRecordingAction, ListRecordingsAction } from "@/server/live-class";
import type { RecordingListItem } from "@/types/live-class";
import RecordingPlayerDialog from "@/components/live-class/RecordingPlayerDialog";
import ClassLogDialog from "@/components/live-class/ClassLogDialog";

const STATUS_LABEL: Record<string, string> = {
  READY: "Ready",
  RECORDING: "Recording / processing",
  FAILED: "Failed",
  DELETED: "Deleted",
};

// Recordings of in-app classes the signed-in admin/HOD is allowed to oversee (the server narrows the list to their scope and permission), with
// the attendance log of each class. Deleting removes the video file for good; the class record, report and hours stay.
export default function AdminRecordingsPage() {
  const [items, setItems] = useState<RecordingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState<RecordingListItem | null>(null);
  const [logFor, setLogFor] = useState<RecordingListItem | null>(null);

  const load = useCallback(async () => {
    const [res, err] = await ListRecordingsAction();
    setError(err);
    setItems(res?.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const remove = async (item: RecordingListItem) => {
    if (!window.confirm(`Permanently delete the recording of "${item.courseTitle}"? The video file is removed from storage and cannot be recovered.`)) return;
    const [, err] = await DeleteRecordingAction(item.id);
    if (err) return ToastError(err);
    ToastSuccess("Recording deleted");
    load();
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Class recordings</h1>
        <p className="text-sm text-gray-600">Recorded in-app classes in your scope, newest first. Recordings are removed automatically after the retention period.</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-sm text-gray-600">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading...
        </div>
      ) : error ? (
        <p className="py-6 text-sm text-gray-700">{error}</p>
      ) : items.length === 0 ? (
        <p className="py-6 text-sm text-gray-600">No recordings in your scope yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs text-gray-600">
              <tr>
                <th className="px-3 py-2">Class</th>
                <th className="px-3 py-2">Tutor</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Recording</th>
                <th className="px-3 py-2">Expires</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-3 py-2 font-medium text-gray-900">{item.courseTitle}</td>
                  <td className="px-3 py-2">{item.tutorName || "-"}</td>
                  <td className="px-3 py-2">{formatScheduleDateTime(item.scheduledDate)}</td>
                  <td className="px-3 py-2">{STATUS_LABEL[item.status ?? ""] ?? item.status ?? "-"}</td>
                  <td className="px-3 py-2">{item.expiresAt && item.status === "READY" ? new Date(item.expiresAt).toLocaleDateString() : "-"}</td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-2">
                      {item.status === "READY" && (
                        <Button size="sm" variant="outline" onClick={() => setPlaying(item)}>
                          Watch
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => setLogFor(item)}>
                        Who joined
                      </Button>
                      {item.status === "READY" && item.canDelete && (
                        <Button size="sm" variant="outline" className="text-red-600" onClick={() => remove(item)}>
                          Delete
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <RecordingPlayerDialog lessonId={playing?.id ?? null} title={playing?.courseTitle} onClose={() => setPlaying(null)} />
      <ClassLogDialog lessonId={logFor?.id ?? null} title={logFor?.courseTitle} onClose={() => setLogFor(null)} />
    </div>
  );
}
