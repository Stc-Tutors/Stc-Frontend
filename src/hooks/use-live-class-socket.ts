"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

// NEXT_PUBLIC_API_URL is the REST base (".../api") - Socket.IO attaches
// directly to stcbe's HTTP server root, not under Express's /api prefix.
function socketBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/api\/?$/, "");
}

interface UseLiveClassSocketOptions {
  // Fired on the TUTOR's device when a learner is waiting to be let in.
  onWaiting?: (payload: { lessonId: string; userId: string; fullName: string }) => void;
  // Fired on the LEARNER's device once the tutor/an admin admits them.
  onAdmitted?: (payload: { lessonId: string }) => void;
  // Fired on the LEARNER's device if they're turned away without being admitted.
  onDenied?: (payload: { lessonId: string }) => void;
  // Fired on a LEARNER's device once the tutor assigns them into a breakout
  // group - carries a fresh token for that group's own LiveKit room.
  onBreakoutMove?: (payload: { lessonId: string; roomId: string; label: string; url: string; token: string }) => void;
  // Fired once the tutor ends the breakout session - carries a fresh token
  // for the main room (the original join token may have gone stale by then).
  onBreakoutEnded?: (payload: { lessonId: string; url: string; token: string }) => void;
}

// A short-lived socket, open only while the classroom/waiting screen is on
// screen - same pattern as useMessagingSocket, just for live-class:* events
// instead of message:*. The JWT lives in an httpOnly cookie, so the handshake
// authenticates with a short-lived copy fetched from /api/socket-token.
export function useLiveClassSocket({ onWaiting, onAdmitted, onDenied, onBreakoutMove, onBreakoutEnded }: UseLiveClassSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const handlersRef = useRef<UseLiveClassSocketOptions>({});
  // Refs are only ever written in an effect, never during render itself.
  useEffect(() => {
    handlersRef.current = { onWaiting, onAdmitted, onDenied, onBreakoutMove, onBreakoutEnded };
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const res = await fetch("/api/socket-token");
      if (!res.ok || cancelled) return;
      const { token } = (await res.json()) as { token: string | null };
      if (!token || cancelled) return;

      const socket = io(socketBaseUrl(), { auth: { token }, transports: ["websocket"] });
      socketRef.current = socket;

      socket.on("live-class:waiting", (payload: { lessonId: string; userId: string; fullName: string }) =>
        handlersRef.current.onWaiting?.(payload)
      );
      socket.on("live-class:admitted", (payload: { lessonId: string }) => handlersRef.current.onAdmitted?.(payload));
      socket.on("live-class:denied", (payload: { lessonId: string }) => handlersRef.current.onDenied?.(payload));
      socket.on("live-class:breakout-move", (payload: { lessonId: string; roomId: string; label: string; url: string; token: string }) =>
        handlersRef.current.onBreakoutMove?.(payload)
      );
      socket.on("live-class:breakout-ended", (payload: { lessonId: string; url: string; token: string }) =>
        handlersRef.current.onBreakoutEnded?.(payload)
      );
    })();

    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);
}
