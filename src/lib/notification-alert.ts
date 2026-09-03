// Sound + vibration + OS-level "notification bar" alert for the in-app
// Notification model (reschedules, new tutor applications, enrollments,
// etc.) - separate from useMessagingSocket's real-time chat popup, which
// only ever covered message:new. This is polled (see NotificationBell), not
// push-driven, so it only fires while this tab/window is open (foreground or
// backgrounded) - it does NOT reach a fully-closed browser, which would need
// real Web Push (VAPID + a service worker) rather than this. The Android app
// (Stc-Mobile) is just this same web app in a Capacitor WebView, so this
// covers it too - vibrate() works there without any native plugin.
let audioCtx: AudioContext | null = null;

export function playNotificationSound(): void {
  try {
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtxClass) return;
    // Reused across calls - browsers cap the number of live AudioContexts,
    // and creating one is the expensive part.
    audioCtx ??= new AudioCtxClass();
    if (audioCtx.state === "suspended") void audioCtx.resume();

    const ctx = audioCtx;
    const now = ctx.currentTime;
    // Two-note "ding-dong" (E6 then C6) - short and distinct without being
    // jarring, no audio asset needed.
    [{ freq: 1318.5, start: 0 }, { freq: 1046.5, start: 0.12 }].forEach(({ freq, start }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(0.2, now + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + 0.35);
      osc.start(now + start);
      osc.stop(now + start + 0.35);
    });
  } catch {
    // Autoplay can be blocked before the user has interacted with the page
    // at all - a missed chime isn't worth surfacing an error for.
  }
  vibrateDevice();
}

// Web Vibration API - supported by Chrome-based mobile browsers and (per
// push-notification-registrar.tsx) the Capacitor Android WebView, but not
// desktop browsers or iOS Safari, both of which just silently no-op here.
function vibrateDevice(): void {
  try {
    navigator.vibrate?.([120, 60, 120]);
  } catch {
    // Never let a vibration failure break the sound/popup it accompanies.
  }
}

export function ensureNotificationPermission(): void {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission === "default") void Notification.requestPermission();
}

export function showBrowserNotification(title: string, body: string, onClick?: () => void): void {
  if (typeof window === "undefined" || !("Notification" in window) || Notification.permission !== "granted") return;
  try {
    const n = new Notification(title, { body, tag: `stc-${Date.now()}` });
    if (onClick) {
      n.onclick = () => {
        window.focus();
        onClick();
        n.close();
      };
    }
  } catch {
    // Some platforms (e.g. iOS Safari) advertise the Notification
    // constructor but throw on use - never let this break polling.
  }
}
