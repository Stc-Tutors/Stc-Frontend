"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

function socketBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/api\/?$/, "");
}

// How long to wait after the last local change before sending it - Excalidraw's
// onChange fires on every tiny mouse-move mid-stroke, so sending on every call
// would flood the socket. The backend separately coalesces its own database
// writes (see stcbe's socket.gateway.ts), but the WIRE traffic itself is only
// ever this frequent.
const SEND_DEBOUNCE_MS = 250;

interface SceneMessage {
  lessonId: string;
  elementsJson: string;
  // Only present on the initial join reply, not on every subsequent update.
  canEdit?: boolean;
}

interface UseWhiteboardSyncOptions {
  // Fires once per incoming scene (the initial join reply, or a peer's later
  // update). The caller merges it into Excalidraw's own state
  // (reconcileElements + excalidrawAPI.updateScene) - this hook doesn't touch
  // Excalidraw directly, so it has no dependency on which version is mounted.
  onRemoteScene?: (elementsJson: string) => void;
}

interface UseWhiteboardSyncResult {
  // Undefined until the first whiteboard:scene arrives.
  canEdit: boolean | undefined;
  // Call on every local onChange; internally debounced before it's sent.
  sendUpdate: (elementsJson: string) => void;
  isConnected: boolean;
}

// One socket per mounted whiteboard, open only while it's on screen - same
// short-lived pattern as useLiveClassSocket/useMessagingSocket, just
// bidirectional (this one also sends, not just listens).
export function useWhiteboardSync(lessonId: string, { onRemoteScene }: UseWhiteboardSyncOptions = {}): UseWhiteboardSyncResult {
  const socketRef = useRef<Socket | null>(null);
  const sendTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingElementsRef = useRef<string | null>(null);
  const [canEdit, setCanEdit] = useState<boolean | undefined>(undefined);
  const [isConnected, setIsConnected] = useState(false);

  // Refs are only ever written in an effect, never during render itself.
  const handlerRef = useRef<UseWhiteboardSyncOptions["onRemoteScene"]>(undefined);
  useEffect(() => {
    handlerRef.current = onRemoteScene;
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

      socket.on("connect", () => {
        setIsConnected(true);
        socket.emit("whiteboard:join", { lessonId });
      });
      socket.on("disconnect", () => setIsConnected(false));
      socket.on("whiteboard:scene", (msg: SceneMessage) => {
        if (msg.lessonId !== lessonId) return;
        if (msg.canEdit !== undefined) setCanEdit(msg.canEdit);
        handlerRef.current?.(msg.elementsJson);
      });
    })();

    return () => {
      cancelled = true;
      if (sendTimerRef.current) clearTimeout(sendTimerRef.current);
      if (socketRef.current) {
        socketRef.current.emit("whiteboard:leave", { lessonId });
        socketRef.current.disconnect();
      }
      socketRef.current = null;
    };
  }, [lessonId]);

  const sendUpdate = (elementsJson: string) => {
    pendingElementsRef.current = elementsJson;
    if (sendTimerRef.current) clearTimeout(sendTimerRef.current);
    sendTimerRef.current = setTimeout(() => {
      if (pendingElementsRef.current !== null) {
        socketRef.current?.emit("whiteboard:update", { lessonId, elementsJson: pendingElementsRef.current });
      }
    }, SEND_DEBOUNCE_MS);
  };

  return { canEdit, sendUpdate, isConnected };
}
