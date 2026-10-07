"use client";

import { useEffect, useRef, useState } from "react";
import { useDataChannel, useLocalParticipant } from "@livekit/components-react";
import { Hand } from "lucide-react";

const REACTIONS = ["👍", "🎉", "😂", "❤️"];
const TOPIC = "reaction";
// How long a raised hand stays "raised" if the student doesn't lower it
// themselves - keeps a forgotten raised hand from sitting there all class.
const HAND_AUTO_LOWER_MS = 2 * 60 * 1000;
// How long an incoming reaction/hand toast stays on screen.
const TOAST_LIFETIME_MS = 4000;

interface ReactionMessage {
  kind: "hand-up" | "hand-down" | "reaction";
  emoji?: string;
  name: string;
}

interface Toast {
  id: number;
  text: string;
}

// A quick, non-disruptive way to signal the tutor without interrupting with
// video/audio - sent over LiveKit's data channel (no media, so it's cheap and
// instant). Never offered to an observer: their token has no publish-data
// grant at all (see LiveKitService.issueToken), so there's nothing to show.
export default function ReactionsBar() {
  const { localParticipant } = useLocalParticipant();
  const [handRaised, setHandRaised] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);
  const handTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addToast = (text: string) => {
    const id = toastId.current++;
    setToasts((prev) => [...prev, { id, text }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), TOAST_LIFETIME_MS);
  };

  const { send } = useDataChannel(TOPIC, (msg) => {
    try {
      const data = JSON.parse(new TextDecoder().decode(msg.payload)) as ReactionMessage;
      if (data.kind === "hand-up") addToast(`✋ ${data.name} raised their hand`);
      else if (data.kind === "reaction") addToast(`${data.emoji} ${data.name}`);
      // hand-down is reflected by removing any toast for that name, which
      // naturally happens as toasts auto-expire - no action needed here.
    } catch {
      // Ignore anything that isn't our own message shape.
    }
  });

  const publish = (payload: ReactionMessage) => {
    send(new TextEncoder().encode(JSON.stringify(payload)), { reliable: true });
  };

  const name = localParticipant.name || localParticipant.identity;

  const toggleHand = () => {
    const next = !handRaised;
    setHandRaised(next);
    publish({ kind: next ? "hand-up" : "hand-down", name });
    if (handTimer.current) clearTimeout(handTimer.current);
    if (next) {
      handTimer.current = setTimeout(() => {
        setHandRaised(false);
        publish({ kind: "hand-down", name });
      }, HAND_AUTO_LOWER_MS);
    }
  };

  const sendReaction = (emoji: string) => publish({ kind: "reaction", emoji, name });

  useEffect(() => () => {
    if (handTimer.current) clearTimeout(handTimer.current);
  }, []);

  return (
    <>
      <div className="flex items-center gap-1.5 rounded-full border border-gray-300 bg-white/90 px-2 py-1.5">
        <button
          type="button"
          onClick={toggleHand}
          aria-pressed={handRaised}
          title={handRaised ? "Lower hand" : "Raise hand"}
          className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition-colors ${
            handRaised ? "bg-amber-100 text-amber-800" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <Hand className="h-3.5 w-3.5" />
        </button>
        <span className="h-4 w-px bg-gray-200" />
        {REACTIONS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => sendReaction(emoji)}
            title={`Send ${emoji}`}
            className="rounded-full px-1.5 py-1 text-sm hover:bg-gray-100"
          >
            {emoji}
          </button>
        ))}
      </div>

      <div className="pointer-events-none absolute bottom-36 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1.5">
        {toasts.map((t) => (
          <span key={t.id} className="animate-in fade-in rounded-full bg-black/70 px-3 py-1 text-sm text-white shadow-sm">
            {t.text}
          </span>
        ))}
      </div>
    </>
  );
}
