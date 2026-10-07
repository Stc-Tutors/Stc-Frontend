"use client";

import { useConnectionQualityIndicator, useLocalParticipant } from "@livekit/components-react";
import { ConnectionQuality } from "livekit-client";
import { Wifi, WifiOff } from "lucide-react";

const LABEL: Record<ConnectionQuality, { text: string; className: string }> = {
  [ConnectionQuality.Excellent]: { text: "Good connection", className: "text-emerald-300" },
  [ConnectionQuality.Good]: { text: "Good connection", className: "text-emerald-300" },
  [ConnectionQuality.Poor]: { text: "Weak connection", className: "text-amber-300" },
  [ConnectionQuality.Lost]: { text: "Connection lost", className: "text-red-400" },
  [ConnectionQuality.Unknown]: { text: "Checking connection...", className: "text-gray-300" },
};

// Self-diagnostic only - lets someone see "is it my connection?" before
// blaming the class, and explains a lagging call rather than leaving it a
// mystery.
export default function SelfConnectionQuality() {
  const { localParticipant } = useLocalParticipant();
  const { quality } = useConnectionQualityIndicator({ participant: localParticipant });
  const info = LABEL[quality] ?? LABEL[ConnectionQuality.Unknown];
  const Icon = quality === ConnectionQuality.Lost ? WifiOff : Wifi;

  return (
    <span className={`flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium ${info.className}`}>
      <Icon className="h-3 w-3" />
      {info.text}
    </span>
  );
}
