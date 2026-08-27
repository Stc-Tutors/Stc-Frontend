"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { ToastError, ToastSuccess } from "@/components/ui/custom/toast";
import { GetUserAction, UpdateUserAction } from "@/server/user";

// Opt-out for stcbe's MessageEmailNotificationJob - the debounced email nudge
// sent when a message arrives while this user is offline. Defaults on, so
// this only ever needs to be touched to turn it off.
export default function NotificationPreferencesForm() {
  const [enabled, setEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    GetUserAction().then(([res]) => {
      setEnabled(res?.data?.messagingEmailNotifications ?? true);
      setIsLoading(false);
    });
  }, []);

  const handleToggle = async (checked: boolean) => {
    setEnabled(checked);
    setIsSaving(true);
    const [, error] = await UpdateUserAction({ messagingEmailNotifications: checked });
    setIsSaving(false);
    if (error) {
      setEnabled(!checked);
      ToastError(error);
      return;
    }
    ToastSuccess("Notification preference saved");
  };

  if (isLoading) return null;

  return (
    <section className="bg-white rounded-2xl shadow p-6 max-w-2xl">
      <h2 className="font-bold text-lg mb-1">Message Notifications</h2>
      <p className="text-sm text-gray-500 mb-4">
        Get an email when someone messages you and you&apos;re not online to see it right away.
      </p>
      <label className="flex items-center gap-3 text-sm text-gray-800 cursor-pointer w-fit">
        <input
          type="checkbox"
          checked={enabled}
          disabled={isSaving}
          onChange={(e) => handleToggle(e.target.checked)}
          className="size-4"
        />
        Email me about unread messages
        {isSaving && <Loader2 className="size-4 animate-spin text-gray-400" />}
      </label>
    </section>
  );
}
