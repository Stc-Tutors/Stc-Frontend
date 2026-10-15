"use client";

import { ParticipantTile, useTracks } from "@livekit/components-react";
import { Track } from "livekit-client";

// A small floating row of everyone's camera, for whenever the main view is
// given over to something else (the whiteboard) - same idea as Zoom/Meet's
// own small self/participant thumbnails during a presentation, so nobody
// disappears just because the whiteboard is open. Must be rendered INSIDE
// <LiveKitRoom> (it reads the room's tracks via context) but is positioned
// with a z-index above the whiteboard overlay, which sits elsewhere in the
// DOM as a sibling of the room.
export default function ThumbnailStrip() {
  const tracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: true }], { onlySubscribed: false });
  if (tracks.length === 0) return null;
  return (
    <div className="pointer-events-none absolute bottom-3 left-3 z-30 flex max-w-[80%] gap-2 overflow-x-auto">
      {tracks.map((t) => (
        <div
          key={`${t.participant.identity}-${t.source}`}
          className="pointer-events-auto h-20 w-28 shrink-0 overflow-hidden rounded-md border-2 border-white/60 shadow-lg [&_.lk-participant-metadata]:text-[10px]"
        >
          <ParticipantTile trackRef={t} disableSpeakingIndicator />
        </div>
      ))}
    </div>
  );
}
