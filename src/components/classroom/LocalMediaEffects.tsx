"use client";

import { useEffect, useRef, useState } from "react";
import { useLocalParticipant } from "@livekit/components-react";
import type { LocalAudioTrack, LocalVideoTrack } from "livekit-client";
import { Sparkles } from "lucide-react";

// Both of these run entirely in this browser tab - no server call, no LiveKit
// Cloud subscription, no extra cost. They're dynamically imported so the
// (sizable, WASM-backed) processing code only loads for someone who's
// actually about to publish audio/video, never for an observer or anyone
// just loading the page.
type KrispModule = typeof import("@livekit/krisp-noise-filter");
type TrackProcessorsModule = typeof import("@livekit/track-processors");

// Applies background noise suppression to the local mic the moment a
// microphone track exists, and keeps it applied if the track is replaced
// (e.g. the person switches input device). Silent and on by default - no
// control needed, same as any other call app's baseline audio cleanup. Call
// this once, at the top of the room view - not tied to any particular button.
export function useNoiseSuppression() {
  const { microphoneTrack } = useLocalParticipant();
  const appliedTo = useRef<unknown>(null);

  useEffect(() => {
    // The local participant's own mic track is always a LocalAudioTrack at
    // runtime - useLocalParticipant() just types it as the broader
    // TrackPublication shape shared with remote participants.
    const track = microphoneTrack?.track as LocalAudioTrack | undefined;
    if (!track || appliedTo.current === track) return;
    let cancelled = false;
    (async () => {
      try {
        const { KrispNoiseFilter }: KrispModule = await import("@livekit/krisp-noise-filter");
        if (cancelled) return;
        await track.setProcessor(KrispNoiseFilter());
        appliedTo.current = track;
      } catch (error) {
        // Never block the call over a quality-of-life filter failing to load
        // (e.g. a browser without WASM support).
        console.warn("Noise suppression unavailable", error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [microphoneTrack]);
}

// A small button that toggles background blur on the local camera. Off by
// default (it costs real CPU on a weak device) - the person opts in.
export function BackgroundBlurToggle() {
  const { cameraTrack } = useLocalParticipant();
  const [enabled, setEnabled] = useState(false);
  const [supported, setSupported] = useState(true);
  const [busy, setBusy] = useState(false);
  const tpModule = useRef<TrackProcessorsModule | null>(null);

  useEffect(() => {
    import("@livekit/track-processors").then((mod) => {
      tpModule.current = mod;
      setSupported(mod.supportsBackgroundProcessors());
    });
  }, []);

  const toggle = async () => {
    // Same reasoning as the mic track above - this is always a LocalVideoTrack
    // for the local participant.
    const track = cameraTrack?.track as LocalVideoTrack | undefined;
    if (!track) return;
    setBusy(true);
    try {
      const mod = tpModule.current ?? (await import("@livekit/track-processors"));
      tpModule.current = mod;
      if (enabled) {
        await track.stopProcessor();
      } else {
        await track.setProcessor(mod.BackgroundProcessor({ mode: "background-blur", blurRadius: 10 }));
      }
      setEnabled((v) => !v);
    } catch (error) {
      console.warn("Couldn't toggle background blur", error);
    } finally {
      setBusy(false);
    }
  };

  if (!supported || !cameraTrack) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={enabled}
      title={enabled ? "Turn off background blur" : "Blur my background"}
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        enabled ? "border-blue-400 bg-blue-50 text-blue-700" : "border-gray-300 bg-white/90 text-gray-700 hover:bg-gray-50"
      }`}
    >
      <Sparkles className="h-3.5 w-3.5" />
      Blur
    </button>
  );
}
