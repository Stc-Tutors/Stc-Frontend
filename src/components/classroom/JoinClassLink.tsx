"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getJoinWindow } from "@/lib/class-join-window";

interface JoinClassLinkProps {
  lessonId: string;
  scheduledDate: string;
  durationMinutes: number;
  className: string;
  label?: string;
}

function formatCountdown(msUntilOpen: number): string {
  const minutes = Math.ceil(msUntilOpen / 60000);
  if (minutes <= 1) return "Opens in 1m";
  if (minutes < 60) return `Opens in ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;
  if (hours < 24) return `Opens in ${hours}h${remMinutes ? ` ${remMinutes}m` : ""}`;
  return `Opens ${new Date(Date.now() + msUntilOpen).toLocaleDateString([], { month: "short", day: "numeric" })}`;
}

// Renders an active "Join Class" link only once inside the 10-minute
// pre-class window (see class-join-window.ts); before/after that it's a
// disabled control showing a countdown or "Class ended" instead.
export default function JoinClassLink({ lessonId, scheduledDate, durationMinutes, className, label = "Join Class" }: JoinClassLinkProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  const { isJoinable, hasEnded, opensAt } = getJoinWindow(scheduledDate, durationMinutes, now);

  if (isJoinable) {
    return (
      <Link href={`/lms-home/classroom/live/${lessonId}`} className={className}>
        {label}
      </Link>
    );
  }

  const statusText = hasEnded ? "Class ended" : formatCountdown(opensAt - now);

  return (
    <span
      className={`${className} opacity-50 grayscale cursor-not-allowed pointer-events-none`}
      title={hasEnded ? "This class session has ended" : "Available 10 minutes before the class starts"}
    >
      {label} &middot; {statusText}
    </span>
  );
}
