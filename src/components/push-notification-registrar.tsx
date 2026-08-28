"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@/contexts/user-context";
import { RegisterDeviceTokenAction } from "@/server/device-token";

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

      PushNotifications.addListener("registration", (token) => {
        RegisterDeviceTokenAction(token.value, "ANDROID");
      });
      PushNotifications.addListener("registrationError", (err) => {
        console.error("Push registration failed", err);
      });

      await PushNotifications.register();
    })();
  }, [user]);

  return null;
}
