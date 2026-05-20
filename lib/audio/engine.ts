// Singleton Web Audio engine. All sounds in this app are synthesized at
// runtime — no audio files in the bundle. Lazy-inits the AudioContext on
// first use (which must happen inside a user-gesture handler, per browser
// autoplay policy) and routes everything through one master gain node so
// the mute toggle can hard-zero the volume.

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let muted = false;

const MASTER_VOL = 0.65;

type AudioCtor = typeof AudioContext;

const getCtor = (): AudioCtor | null => {
  if (typeof window === 'undefined') return null;
  const w = window as Window & { webkitAudioContext?: AudioCtor };
  return window.AudioContext ?? w.webkitAudioContext ?? null;
};

// Ensures the audio context exists and is running. Returns null when
// running on the server, when the browser lacks Web Audio support, or
// when the context can't be created (silent failure — sound is a nice-
// to-have, never a blocker).
export const ensureCtx = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor = getCtor();
    if (!Ctor) return null;
    try {
      ctx = new Ctor();
    } catch {
      return null;
    }
    masterGain = ctx.createGain();
    masterGain.gain.value = muted ? 0 : MASTER_VOL;
    masterGain.connect(ctx.destination);
  }
  // Browsers may suspend the context until user-gesture. resume() is a
  // no-op if it's already running. Errors are swallowed — we'll just be
  // silent until the user interacts again.
  if (ctx.state === 'suspended') {
    void ctx.resume().catch(() => undefined);
  }
  return ctx;
};

export const master = (): AudioNode | null => {
  ensureCtx();
  return masterGain;
};

export const setMuted = (next: boolean): void => {
  muted = next;
  if (masterGain && ctx) {
    // Quick ramp so the cut isn't a jarring pop.
    const now = ctx.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(masterGain.gain.value, now);
    masterGain.gain.linearRampToValueAtTime(next ? 0 : MASTER_VOL, now + 0.05);
  }
};

export const isMuted = (): boolean => muted;
