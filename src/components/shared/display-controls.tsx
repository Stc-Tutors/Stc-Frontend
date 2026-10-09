"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun, Type } from "lucide-react";

type Theme = "light" | "dark" | "system";
const THEME_KEY = "stc-theme";
const SCALE_KEY = "stc-text-scale";
const THEME_ORDER: Theme[] = ["light", "dark", "system"];
// Percent of the browser's base font size. Every rem-based size in the app scales with it.
const SCALES = [100, 112.5, 125];

const read = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* private mode - the choice just doesn't persist */
  }
};

export function applyTheme(theme: Theme) {
  const dark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

// Day/night switch + text-size stepper for the portal headers. The pre-paint script in the root layout applies the saved choice before
// first render (no flash); this component only changes and stores it.
export default function DisplayControls() {
  const [theme, setTheme] = useState<Theme>("light");
  const [scale, setScale] = useState(100);

  useEffect(() => {
    const t = read(THEME_KEY);
    // Read after mount so server and first client render agree.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (t === "light" || t === "dark" || t === "system") setTheme(t);
    const s = Number(read(SCALE_KEY));
    if (SCALES.includes(s)) setScale(s);
  }, []);

  // In "system" mode follow the device live (e.g. it flips to dark at sunset).
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  const cycleTheme = () => {
    const next = THEME_ORDER[(THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length];
    setTheme(next);
    write(THEME_KEY, next);
    applyTheme(next);
  };

  const cycleScale = () => {
    const next = SCALES[(SCALES.indexOf(scale) + 1) % SCALES.length];
    setScale(next);
    write(SCALE_KEY, String(next));
    document.documentElement.style.fontSize = `${next}%`;
  };

  const Icon = theme === "dark" ? Moon : theme === "system" ? Monitor : Sun;
  const label = theme === "dark" ? "Night mode" : theme === "system" ? "Match device" : "Day mode";

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={cycleTheme}
        title={`${label} - click to change`}
        aria-label={`Colour theme: ${label}. Click to change.`}
        className="p-2 rounded-full hover:bg-gray-100 transition shrink-0"
      >
        <Icon className="size-5 text-gray-600" />
      </button>
      <button
        type="button"
        onClick={cycleScale}
        title={`Text size ${scale === 100 ? "normal" : scale === 112.5 ? "large" : "extra large"} - click to change`}
        aria-label="Change text size"
        className="p-2 rounded-full hover:bg-gray-100 transition shrink-0 hidden sm:block"
      >
        <Type className="size-5 text-gray-600" />
      </button>
    </div>
  );
}
