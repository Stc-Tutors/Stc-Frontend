"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@/contexts/user-context";
import { RegisterDeviceTokenAction } from "@/server/device-token";
import { playNotificationSound } from "@/lib/notification-alert";

// Renders nothing - just registers this device for push once a user is
// logged in, and only inside the Capacitor-wrapped Android app (Stc-Mobile).
// A normal browser tab (or the Electron desktop app, which isn't a Capacitor
// native platform) hits the isNativePlatform() check and no-ops immediately,
// so @capacitor/* is never even imported outside the Android app - see
// use-messaging-socket.ts for how the desktop app gets notifications instead
// (the standard web Notification API, since it's just a BrowserView).
export default function PushNotificationRegistrar() {
  const { user } = useUser();
  const registeredRef = useRef(false);

  useEffect(() => {
    if (!user || registeredRef.current) return;

    (async () => {
      const { Capacitor } = await import("@capacitor/core");
      if (!Capacitor.isNativePlatform()) return;

      const { PushNotifications } = await import("@capacitor/push-notifications");
      const permission = await PushNotifications.requestPermissions();
      if (permission.receive !== "granted") return;

      registeredRef.current = true;

      // Android 8+ decides sound and pop-up behaviour per channel. The server names this channel on every push (stcbe ANDROID_CHANNEL_ID),
      // so create it loud: without it messages arrive silently or only when the app is opened.
      try {
        await PushNotifications.createChannel({
          id: "stc_alerts",
          name: "STC alerts",
          description: "Messages, class reminders and updates",
          importance: 5,
          visibility: 0,
          sound: "default",
          vibration: true,
          lights: true,
        });
      } catch {
        // older Android - the default channel is used
      }

      PushNotifications.addListener("registration", (token) => {
        RegisterDeviceTokenAction(token.value, "ANDROID");
      });
      PushNotifications.addListener("registrationError", (err) => {
        console.error("Push registration failed", err);
      });
      // Android's FCM SDK only auto-shows a push in the system tray while
      // this app is backgrounded - a push that arrives while it's open in
      // the foreground reaches here instead with no system UI of its own,
      // so without this listener it was silently dropped: no banner, no
      // sound, nothing (the polling NotificationBell would eventually pick
      // it up too, but the point of push is not waiting on that).
      PushNotifications.addListener("pushNotificationReceived", () => {
        playNotificationSound();
      });
      // Tapping a notification (app backgrounded or cold-started from it) -
      // navigate straight to the conversation/page it's about instead of
      // just resuming wherever the app was. `link` is whatever NotificationService.notify
      // was given (see message-links.ts), a same-origin path in every case
      // this app (locked to lms-home) can reach, so a plain location change
      // resolves it correctly.
      PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
        const link = action.notification.data?.link as string | undefined;
        if (link) window.location.href = link;
      });

      await PushNotifications.register();
    })();
  }, [user]);

  return null;
}
