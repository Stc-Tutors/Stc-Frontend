import { useEffect, useRef } from "react";

// An element with role="combobox" does not get its accessible name from the text inside it, so a dropdown button that shows
// "Nigeria" or "Select..." is still announced as an unnamed control. This names it from what it currently shows (or `fallback`
// when it shows nothing), unless a real label is already wired to it (a <label for>, aria-labelledby, or a hand-written aria-label).
export function useComboboxName<T extends HTMLElement>(fallback = "Select an option") {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const automatic = el.dataset.autoName === "1";
    if (el.hasAttribute("aria-labelledby")) return;
    if (el.hasAttribute("aria-label") && !automatic) return;
    const labels = (el as unknown as { labels?: NodeListOf<HTMLLabelElement> }).labels;
    if (labels && labels.length > 0) return;
    el.setAttribute("aria-label", (el.textContent ?? "").replace(/\s+/g, " ").trim() || fallback);
    el.dataset.autoName = "1";
  });
  return ref;
}
