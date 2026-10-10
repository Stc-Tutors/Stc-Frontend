"use client";

import { useRef } from "react";
import { CaptureUpdateAction, Excalidraw, reconcileElements } from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import type { OrderedExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import type { RemoteExcalidrawElement } from "@excalidraw/excalidraw/data/reconcile";
import "@excalidraw/excalidraw/index.css";
import { useWhiteboardSync } from "@/hooks/use-whiteboard-sync";

interface WhiteboardPanelProps {
  lessonId: string;
}

// A shared drawing surface for the class, synced over the Socket.IO server
// stcbe already runs (see use-whiteboard-sync.ts / stcbe's socket.gateway.ts) -
// no separate collaboration server to host. Conflict resolution between
// concurrent edits is Excalidraw's own official reconcileElements, not
// anything hand-rolled here, so it merges the same way excalidraw.com itself
// does.
export default function WhiteboardPanel({ lessonId }: WhiteboardPanelProps) {
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);
  // Set just before an incoming remote scene is applied via updateScene, so
  // the onChange that fires because of OUR OWN updateScene call doesn't get
  // re-broadcast right back out - only genuine local edits are sent.
  const applyingRemoteRef = useRef(false);

  const { canEdit, sendUpdate } = useWhiteboardSync(lessonId, {
    onRemoteScene: (elementsJson) => {
      const api = apiRef.current;
      if (!api) return;
      // The wire format is just JSON.parse'd peer data - it can never hold
      // Excalidraw's internal "remote" brand for real, so this cast is the
      // same one Excalidraw's own reference collab example uses.
      let remoteElements: readonly RemoteExcalidrawElement[];
      try {
        remoteElements = JSON.parse(elementsJson) as readonly OrderedExcalidrawElement[] as readonly RemoteExcalidrawElement[];
      } catch {
        return;
      }
      const reconciled = reconcileElements(api.getSceneElementsIncludingDeleted(), remoteElements, api.getAppState());
      applyingRemoteRef.current = true;
      api.updateScene({ elements: reconciled, captureUpdate: CaptureUpdateAction.NEVER });
    },
  });

  return (
    <div className="h-full w-full" data-lk-theme="default">
      <Excalidraw
        excalidrawAPI={(api) => {
          apiRef.current = api;
        }}
        viewModeEnabled={canEdit !== true}
        onChange={(elements) => {
          if (applyingRemoteRef.current) {
            applyingRemoteRef.current = false;
            return;
          }
          sendUpdate(JSON.stringify(elements));
        }}
      />
    </div>
  );
}
