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

// Some browsers (especially Safari) silently drop oscillator events
// scheduled in the past after resume() completes. Sound functions add
// this small offset to currentTime so the schedule is always in the
// future when audio actually starts running.
export const SAFE_START_OFFSET = 0.04;

// Auto-bootstrap: attach a one-shot "first user gesture" listener as
// soon as this module is loaded. Calling ensureCtx() from inside a
// gesture handler is what actually transitions the AudioContext from
// "suspended" to "running", so by the time any sound-playing function
// is called, the context is already unlocked.
let bootstrapAttached = false;

const attachBootstrap = (): void => {
  if (bootstrapAttached) return;
  if (typeof window === 'undefined') return;
  bootstrapAttached = true;

  const unlock = () => {
    const c = ensureCtx();
    if (!c) return;

    // iOS Safari quirk #1: a one-sample silent buffer played inside the
    // user gesture handler fully primes the audio pipeline. Without this
    // some iOS versions stay "muted" even after resume() reports running.
    try {
      const buf = c.createBuffer(1, 1, 22050);
      const src = c.createBufferSource();
      src.buffer = buf;
      src.connect(c.destination);
      src.start(0);
    } catch {
      // Older iOS may throw on createBufferSource — ignore and rely on resume
    }

    // iOS Safari quirk #2: resume must be called synchronously from inside
    // the gesture handler. The promise itself can still be async — what
    // matters is the invocation happens during the gesture window.
    if (c.state === 'suspended') {
      void c.resume().catch(() => undefined);
    }

    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('touchstart', unlock);
    window.removeEventListener('touchend', unlock);
    window.removeEventListener('keydown', unlock);
    window.removeEventListener('click', unlock);
    window.removeEventListener('scroll', unlock);
  };

  // Listen for every plausible gesture type. iOS doesn't reliably treat
  // passive scroll as a gesture for audio-unlock purposes, so we lean on
  // pointerdown/touchstart/touchend/click as well.
  window.addEventListener('pointerdown', unlock);
  window.addEventListener('touchstart', unlock, { passive: true });
  window.addEventListener('touchend', unlock);
  window.addEventListener('keydown', unlock);
  window.addEventListener('click', unlock);
  window.addEventListener('scroll', unlock, { passive: true });
};

attachBootstrap();
