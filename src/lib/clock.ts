// The current time (ms since epoch), read at the moment it is called.
//
// Some screens deliberately work out "is this class joinable / past its grace period / inside the reschedule window yet" from the
// time of THIS render (they re-evaluate whenever the screen re-renders; none of them runs its own timer). Reading the clock through
// one named function keeps that intent explicit and in one place instead of scattering raw Date.now() calls through render code.
export function currentTime(): number {
  return Date.now();
}
