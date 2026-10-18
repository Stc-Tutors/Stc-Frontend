"use client";

import { useCallback, useEffect, useState } from "react";
import { BellRing, X } from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { GetWebPushKeyAction, RegisterDeviceTokenAction } from "@/server/device-token";

const DISMISSED_KEY = "stc-web-push-dismissed";

// VAPID public keys travel as base64url; the browser wants raw bytes.
function keyToBytes(base64Url: string): Uint8Array<ArrayBuffer> {
  const padded = (base64Url + "=".repeat((4 - (base64Url.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(padded);
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

const supported = () =>
  typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

// Class reminders and other notifications in the browser, even when the site isn't open. Once notifications are allowed this subscribes
// silently on every visit; until then a small banner invites the person to turn them on (a browser only shows its own permission prompt
// in response to a click). The Android app has its own push (see push-notification-registrar.tsx) and the desktop app is not a normal browser,
// so neither shows this.
export default function WebPushRegistrar() {
  const { user } = useUser();
  const [showBanner, setShowBanner] = useState(false);

  const subscribe = useCallback(async () => {
    try {
      const [keyRes] = await GetWebPushKeyAction();
      const publicKey = keyRes?.data?.publicKey;
      if (!publicKey) return; // browser push isn't configured on the server yet
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      const subscription = existing ?? (await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyToBytes(publicKey) }));
      await RegisterDeviceTokenAction(JSON.stringify(subscription.toJSON()), "WEB");
    } catch (error) {
      console.warn("Browser notifications could not be set up", error);
    }
  }, []);

  useEffect(() => {
    if (!user || !supported()) return;
    (async () => {
      const { Capacitor } = await import("@capacitor/core");
      if (Capacitor.isNativePlatform()) return;
      if (navigator.userAgent.includes("Electron")) return;

      if (Notification.permission === "granted") {
        void subscribe();
        return;
      }
      if (Notification.permission === "denied") return;
      let dismissed = false;
      try {
        dismissed = localStorage.getItem(DISMISSED_KEY) === "1";
      } catch {
        // storage unavailable - just show the banner
      }
      if (!dismissed) setShowBanner(true);
    })();
  }, [user, subscribe]);

  if (!showBanner) return null;

  const enable = async () => {
    const result = await Notification.requestPermission();
    setShowBanner(false);
    if (result === "granted") void subscribe();
  };
  const dismiss = () => {
    setShowBanner(false);
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // ignore
    }
  };

  return (
    <div role="region" aria-label="Turn on class reminders" className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-md items-start gap-3 rounded-xl border bg-white p-4 shadow-lg sm:left-auto sm:right-4 sm:mx-0">
      <BellRing className="mt-0.5 h-5 w-5 shrink-0 text-[#0a7ac2]" aria-hidden="true" />
      <div className="flex-1 text-sm">
        <p className="font-medium text-gray-900">Never miss a class</p>
        <p className="mt-0.5 text-gray-600">Turn on notifications and we&apos;ll remind you before each class starts - even when this site is closed.</p>
        <div className="mt-3 flex gap-2">
          <button type="button" onClick={enable} className="rounded-md bg-[#0a7ac2] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#1c9ae0]">
            Turn on reminders
          </button>
          <button type="button" onClick={dismiss} className="rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100">
            Not now
          </button>
        </div>
      </div>
      <button type="button" onClick={dismiss} aria-label="Close" className="text-gray-400 hover:text-gray-700">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
