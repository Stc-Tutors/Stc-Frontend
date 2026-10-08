"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocalParticipant } from "@livekit/components-react";
import { Track } from "livekit-client";
import { Eraser, Monitor, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToastError } from "@/components/ui/custom/toast";

const COLORS = ["#ef4444", "#22c55e", "#3b82f6", "#eab308", "#111827", "#ffffff"];

// A screen share that bakes the presenter's own drawing directly into the
// video pixels before they're published - so every viewer (and the room's
// recording) sees the markup as part of the share, not as a separate overlay
// that only this app's UI could render. There's no server/LiveKit feature
// for this; it's a plain canvas compositing trick: draw the live screen
// capture onto a canvas every frame, draw the presenter's persistent
// annotation layer on top of that same canvas, then publish the CANVAS's own
// captureStream() as the screen-share track instead of the raw capture.
//
// Deliberately a second, separate "Share & Draw" control (not a replacement
// for VideoConference's own built-in screen-share button) - forking that
// control bar to intercept its publish step isn't worth the risk for this.
// A plain share still works exactly as before; this is for when the
// presenter specifically wants to mark up what they're showing.
export default function AnnotatedScreenShare() {
  const { localParticipant, isScreenShareEnabled } = useLocalParticipant();
  const [active, setActive] = useState(false);
  const [color, setColor] = useState(COLORS[0]);
  const [erasing, setErasing] = useState(false);
  const [lineWidth, setLineWidth] = useState(4);

  const compositeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const annotationCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const annotationCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const videoElRef = useRef<HTMLVideoElement | null>(null);
  const rawStreamRef = useRef<MediaStream | null>(null);
  const publishedVideoTrackRef = useRef<MediaStreamTrack | null>(null);
  const publishedAudioTrackRef = useRef<MediaStreamTrack | null>(null);
  const rafRef = useRef<number | null>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const stop = useCallback(async () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (publishedVideoTrackRef.current) {
      try {
        await localParticipant.unpublishTrack(publishedVideoTrackRef.current);
      } catch {
        // Already gone (e.g. the room itself disconnected) - nothing left to clean up.
      }
      publishedVideoTrackRef.current.stop();
      publishedVideoTrackRef.current = null;
    }
    if (publishedAudioTrackRef.current) {
      try {
        await localParticipant.unpublishTrack(publishedAudioTrackRef.current);
      } catch {
        // See above.
      }
      publishedAudioTrackRef.current.stop();
      publishedAudioTrackRef.current = null;
    }
    rawStreamRef.current?.getTracks().forEach((t) => t.stop());
    rawStreamRef.current = null;
    videoElRef.current?.pause();
    videoElRef.current = null;
    setActive(false);
  }, [localParticipant]);

  // Stop cleanly if this component itself unmounts mid-share (e.g. the
  // classroom is closed) - best-effort, same cleanup as the button.
  useEffect(() => () => void stop(), [stop]);

  const start = async () => {
    if (isScreenShareEnabled) {
      ToastError("Stop your current screen share first, then start this one.");
      return;
    }
    let raw: MediaStream;
    try {
      raw = await navigator.mediaDevices.getDisplayMedia({ video: { cursor: "always" } as MediaTrackConstraints, audio: true });
    } catch {
      return; // The browser's share picker was cancelled - not an error.
    }
    rawStreamRef.current = raw;
    const videoTrack = raw.getVideoTracks()[0];
    const settings = videoTrack.getSettings();
    const width = settings.width || 1280;
    const height = settings.height || 720;

    const video = document.createElement("video");
    video.srcObject = raw;
    video.muted = true;
    await video.play().catch(() => {});
    videoElRef.current = video;

    const annotationCanvas = document.createElement("canvas");
    annotationCanvas.width = width;
    annotationCanvas.height = height;
    annotationCanvasRef.current = annotationCanvas;
    annotationCtxRef.current = annotationCanvas.getContext("2d");

    const composite = compositeCanvasRef.current;
    if (!composite) return;
    composite.width = width;
    composite.height = height;
    // The displayed box is fixed-width (w-80) - match its aspect ratio to the
    // real capture so drawing coordinates map 1:1 with no letterboxing.
    composite.style.aspectRatio = `${width} / ${height}`;
    const ctx = composite.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      if (!videoElRef.current || !annotationCanvasRef.current) return;
      ctx.drawImage(videoElRef.current, 0, 0, width, height);
      ctx.drawImage(annotationCanvasRef.current, 0, 0);
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    const compositeStream = composite.captureStream(30);
    const compositedVideoTrack = compositeStream.getVideoTracks()[0];
    try {
      await localParticipant.publishTrack(compositedVideoTrack, { source: Track.Source.ScreenShare, name: "screen-share-annotated" });
      publishedVideoTrackRef.current = compositedVideoTrack;
      const audioTrack = raw.getAudioTracks()[0];
      if (audioTrack) {
        await localParticipant.publishTrack(audioTrack, { source: Track.Source.ScreenShareAudio, name: "screen-share-annotated-audio" });
        publishedAudioTrackRef.current = audioTrack;
      }
    } catch (error) {
      ToastError((error as Error)?.message || "Couldn't start sharing your screen");
      await stop();
      return;
    }

    // Fires when the browser's own "Stop sharing" bar is used, not this UI's button.
    videoTrack.addEventListener("ended", () => void stop());
    setActive(true);
  };

  const pointFromEvent = (e: React.PointerEvent<HTMLCanvasElement>): { x: number; y: number } | null => {
    const canvas = compositeCanvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawingRef.current = true;
    lastPointRef.current = pointFromEvent(e);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const ctx = annotationCtxRef.current;
    const from = lastPointRef.current;
    const to = pointFromEvent(e);
    if (!ctx || !from || !to) return;
    ctx.globalCompositeOperation = erasing ? "destination-out" : "source-over";
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    lastPointRef.current = to;
  };

  const endStroke = () => {
    drawingRef.current = false;
    lastPointRef.current = null;
  };

  const clearAnnotations = () => {
    const canvas = annotationCanvasRef.current;
    const ctx = annotationCtxRef.current;
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  if (!active) {
    return (
      <Button size="sm" variant="secondary" onClick={start} title="Share your screen and draw on it live">
        <Monitor className="mr-2 h-4 w-4" />
        Share &amp; Draw
      </Button>
    );
  }

  return (
    <div className="absolute bottom-20 left-3 z-30 w-80 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 bg-gray-50 px-2 py-1.5">
        <div className="flex items-center gap-1">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                setErasing(false);
                setColor(c);
              }}
              title={c}
              className={`h-5 w-5 rounded-full border ${!erasing && color === c ? "ring-2 ring-offset-1 ring-gray-500" : "border-gray-300"}`}
              style={{ backgroundColor: c }}
            />
          ))}
          <button
            type="button"
            onClick={() => setErasing((v) => !v)}
            title="Eraser"
            className={`ml-1 rounded-md p-1 ${erasing ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600"}`}
          >
            <Eraser className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={clearAnnotations} title="Clear drawing" className="rounded-md p-1 text-gray-500 hover:bg-gray-100">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
        <button type="button" onClick={() => void stop()} title="Stop sharing" className="rounded-md p-1 text-gray-500 hover:bg-gray-100">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <input
        type="range"
        min={1}
        max={20}
        value={lineWidth}
        onChange={(e) => setLineWidth(Number(e.target.value))}
        className="w-full px-2 py-1"
        title="Pen size"
      />
      <canvas
        ref={compositeCanvasRef}
        className="block w-full cursor-crosshair touch-none bg-black"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endStroke}
        onPointerLeave={endStroke}
      />
      <p className="px-2 py-1 text-[11px] text-gray-400">Draw directly on your shared screen - everyone sees it live.</p>
    </div>
  );
}
