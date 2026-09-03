"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Message } from "@/types/message";
import { playNotificationSound } from "@/lib/notification-alert";

// NEXT_PUBLIC_API_URL is the REST base (".../api") - Socket.IO attaches
// directly to stcbe's HTTP server root, not under Express's /api prefix, so
// the trailing /api has to come off before connecting.
function socketBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/api\/?$/, "");
}

interface UseMessagingSocketOptions {
  onMessageNew?: (message: Message) => void;
  onMessageDelivered?: (payload: { conversationId: string; userId: string }) => void;
  onMessageRead?: (payload: { conversationId: string; userId: string }) => void;
  // Fired when the socket reconnects after having connected before (not on
  // the initial connect) - lets callers refetch whatever they had open, in
  // case events were missed while disconnected. Mainly matters on Android,
  // where backgrounding the app drops the socket and messages can arrive
  // before it reconnects.
  onReconnect?: () => void;
}

// The JWT lives in an httpOnly cookie, unreachable from client JS - this
// hook fetches a copy of it from the same-origin /api/socket-token route
// (server-side, reads the cookie) purely to authenticate the socket
// handshake. See that route's comment for why this doesn't weaken anything.
export function useMessagingSocket({
  onMessageNew,
  onMessageDelivered,
  onMessageRead,
  onReconnect,
}: UseMessagingSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  // Callbacks are read from a ref inside the socket listeners so this
  // effect only ever runs once per mount, instead of reconnecting whenever
  // the caller passes a new inline function.
  const handlersRef = useRef<UseMessagingSocketOptions>({});
  handlersRef.current = { onMessageNew, onMessageDelivered, onMessageRead, onReconnect };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const res = await fetch("/api/socket-token");
      if (!res.ok || cancelled) return;
      const { token } = (await res.json()) as { token: string | null };
      if (!token || cancelled) return;

      const socket = io(socketBaseUrl(), { auth: { token }, transports: ["websocket"] });
      socketRef.current = socket;

      let hasConnectedBefore = false;
      socket.on("connect", () => {
        setIsConnected(true);
        if (hasConnectedBefore) handlersRef.current.onReconnect?.();
        hasConnectedBefore = true;
      });
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
      }
      socket.on("disconnect", () => setIsConnected(false));
      socket.on("message:new", (message: Message) => {
        handlersRef.current.onMessageNew?.(message);
        // Desktop app (Electron BrowserView) and any regular browser tab
        // both get this for free via the standard web Notification API -
        // only fires while the page/tab isn't focused, so it doesn't nag
        // someone already looking at the conversation.
        if (typeof window !== "undefined" && document.hidden) {
          playNotificationSound();
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("New message", { body: message.body.slice(0, 120) });
          }
        }
      });
      socket.on("message:delivered", (payload: { conversationId: string; userId: string }) =>
        handlersRef.current.onMessageDelivered?.(payload)
      );
      socket.on("message:read", (payload: { conversationId: string; userId: string }) =>
        handlersRef.current.onMessageRead?.(payload)
      );
    })();

    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  const joinConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit("conversation:join", { conversationId });
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit("conversation:leave", { conversationId });
  }, []);

  // Live counterpart to MarkConversationReadAction - fires the same
  // MessageService.markRead path over the socket so the sender's ticks
  // update instantly instead of waiting on the next poll/refetch.
  const notifyRead = useCallback((conversationId: string) => {
    socketRef.current?.emit("message:read", { conversationId });
  }, []);

  return { isConnected, joinConversation, leaveConversation, notifyRead };
}
