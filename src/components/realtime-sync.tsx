"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";
import { useUser } from "@/contexts/user-context";
import { invalidateAll, invalidateTags } from "@/lib/client-cache";

// NEXT_PUBLIC_API_URL is the REST base (".../api") - Socket.IO attaches
// directly to stcbe's HTTP server root, not under Express's /api prefix.
function socketBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/api\/?$/, "");
}

// One app-wide socket for a signed-in user. The backend emits `data:invalidate`
// with a list of tags whenever something the user is looking at changed on the
// server - a wallet credit landing from Paystack's webhook, a payment completing,
// a new notification - and every screen showing that data refetches at once
// (see client-cache.ts). This is what makes a paid top-up show up on the wallet
// page by itself, instead of only after a manual refresh.
//
// Best effort by design: if the socket can't connect, the cache's own
// revalidate-on-focus / on-reconnect / TTL rules still keep screens reasonably
// fresh, and nothing here ever blocks rendering.
export default function RealtimeSync() {
  const { user } = useUser();
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;

    const socket = io(socketBaseUrl(), {
      transports: ["websocket"],
      // A function, so every (re)connect attempt fetches a fresh token - the
      // socket-only token is short-lived (see /api/socket-token), and reusing
      // the first one would leave every reconnect after ~5 minutes failing.
      auth: (cb) => {
        fetch("/api/socket-token")
          .then((res) => (res.ok ? res.json() : { token: null }))
          .then((body: { token: string | null }) => cb({ token: body.token }))
          .catch(() => cb({ token: null }));
      },
    });

    let hasConnectedBefore = false;
    socket.on("connect", () => {
      // Events emitted while this device was offline / backgrounded are gone -
      // treat everything on screen as possibly stale after a reconnect.
      if (hasConnectedBefore) invalidateAll();
      hasConnectedBefore = true;
    });
    socket.on("data:invalidate", (payload: { tags?: string[] }) => {
      if (payload?.tags?.length) invalidateTags(payload.tags);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  return null;
}
