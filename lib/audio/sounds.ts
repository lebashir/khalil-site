// All synthesized sounds for the app. Composed from primitive Web Audio
// nodes (oscillators + filtered noise + envelopes), routed through the
// engine's master gain so the mute toggle controls every sound source
// with a single ramp.

import type { AnnouncementPayload } from '@/lib/announcement';
import { SAFE_START_OFFSET, ensureCtx, master } from './engine';

// Returns a "safe now" — currentTime plus a small buffer. Without this,
// browsers may drop scheduled oscillator events whose start time is in
// the past by the time AudioContext.resume() completes.
const safeNow = (ctx: AudioContext): number => ctx.currentTime + SAFE_START_OFFSET;

// ── Primitive helpers ──────────────────────────────────────────────────────

const noiseSource = (ctx: AudioContext, duration: number): AudioBufferSourceNode => {
  const len = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  return src;
};

const envelope = (
  ctx: AudioContext,
  startAt: number,
  duration: number,
  peak: number,
  attack = 0.005
): GainNode => {
  const g = ctx.createGain();
  const safePeak = Math.max(0.0001, peak);
  g.gain.setValueAtTime(0.0001, startAt);
  g.gain.exponentialRampToValueAtTime(safePeak, startAt + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, startAt + Math.max(attack + 0.01, duration));
  return g;
};

const beep = (
  ctx: AudioContext,
  dest: AudioNode,
  startAt: number,
  freq: number,
  duration: number,
  type: OscillatorType,
  peak: number
): void => {
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startAt);
  const env = envelope(ctx, startAt, duration, peak);
  osc.connect(env);
  env.connect(dest);
  osc.start(startAt);
  osc.stop(startAt + duration + 0.02);
};

// ── Plunger ka-CHUNK (fires when the user presses the plunger) ─────────────

export const playPlunger = (): void => {
  const ctx = ensureCtx();
  const dest = master();
  if (!ctx || !dest) return;
  const t0 = safeNow(ctx);

  // KA — bandpassed noise burst
  const ka = noiseSource(ctx, 0.06);
  const kaFilter = ctx.createBiquadFilter();
  kaFilter.type = 'bandpass';
  kaFilter.frequency.value = 800;
  kaFilter.Q.value = 1.5;
  const kaEnv = envelope(ctx, t0, 0.05, 0.45);
  ka.connect(kaFilter);
  kaFilter.connect(kaEnv);
  kaEnv.connect(dest);
  ka.start(t0);
  ka.stop(t0 + 0.07);

  // CHUNK — lower noise thump
  const t1 = t0 + 0.08;
  const chunk = noiseSource(ctx, 0.1);
  const chunkFilter = ctx.createBiquadFilter();
  chunkFilter.type = 'lowpass';
  chunkFilter.frequency.value = 260;
  const chunkEnv = envelope(ctx, t1, 0.09, 0.42);
  chunk.connect(chunkFilter);
  chunkFilter.connect(chunkEnv);
  chunkEnv.connect(dest);
  chunk.start(t1);
  chunk.stop(t1 + 0.11);

  // Sub-bass thud layered with the chunk
  beep(ctx, dest, t1, 60, 0.12, 'sine', 0.35);
};

// ── Per-payload bursts ─────────────────────────────────────────────────────

const playConfetti = (ctx: AudioContext, dest: AudioNode, t0: number): void => {
  // PFFT! — very short low-passed noise burst (the actual "pop")
  const popDur = 0.045;
  const pop = noiseSource(ctx, popDur);
  const popFilt = ctx.createBiquadFilter();
  popFilt.type = 'lowpass';
  popFilt.frequency.value = 800;
  const popEnv = envelope(ctx, t0, popDur, 0.55, 0.002);
  pop.connect(popFilt);
  popFilt.connect(popEnv);
  popEnv.connect(dest);
  pop.start(t0);
  pop.stop(t0 + popDur + 0.02);
  // Sine click on top for emphasis
  beep(ctx, dest, t0, 500, 0.04, 'sine', 0.35);
  // Paper rustle — bandpassed shimmer trailing after the pop
  const rustleDur = 0.3;
  const rustle = noiseSource(ctx, rustleDur);
  const rustleFilt = ctx.createBiquadFilter();
  rustleFilt.type = 'bandpass';
  rustleFilt.frequency.value = 4500;
  rustleFilt.Q.value = 4;
  const rustleEnv = envelope(ctx, t0 + 0.04, rustleDur, 0.3);
  rustle.connect(rustleFilt);
  rustleFilt.connect(rustleEnv);
  rustleEnv.connect(dest);
  rustle.start(t0 + 0.04);
  rustle.stop(t0 + 0.04 + rustleDur + 0.02);
  // Cheerful chirps on top
  [1400, 1800, 2200].forEach((freq, i) => {
    beep(ctx, dest, t0 + 0.06 + i * 0.06, freq, 0.1, 'triangle', 0.24);
  });
};

const playGold = (ctx: AudioContext, dest: AudioNode, t0: number): void => {
  // Cascading coin pings — rapid metallic chimes at random pitches in
  // the high-C range, tempo loosens as the shower "falls". Mario-coin
  // energy, but raining for ~700ms.
  const palette = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.5];
  const numPings = 14;
  for (let i = 0; i < numPings; i++) {
    const t = t0 + i * 0.05 + Math.random() * 0.015;
    const freq = palette[Math.floor(Math.random() * palette.length)] ?? 880;
    const peak = Math.max(0.08, 0.32 - i * 0.012); // taper off
    // Sine ping (the coin clink)
    beep(ctx, dest, t, freq, 0.12, 'sine', peak);
    // 3rd harmonic for sparkle
    beep(ctx, dest, t, freq * 3, 0.06, 'sine', peak * 0.35);
  }
};

const playNeon = (ctx: AudioContext, dest: AudioNode, t0: number): void => {
  // Bass drop punch — square wave hit, pitch slamming down
  const punch = ctx.createOscillator();
  punch.type = 'square';
  punch.frequency.setValueAtTime(140, t0);
  punch.frequency.exponentialRampToValueAtTime(45, t0 + 0.15);
  const punchEnv = envelope(ctx, t0, 0.18, 0.5);
  punch.connect(punchEnv);
  punchEnv.connect(dest);
  punch.start(t0);
  punch.stop(t0 + 0.2);
  // Sawtooth pitch-sweep zap (the rave synth lead)
  const zap = ctx.createOscillator();
  zap.type = 'sawtooth';
  zap.frequency.setValueAtTime(1600, t0 + 0.08);
  zap.frequency.exponentialRampToValueAtTime(90, t0 + 0.42);
  const zapFilt = ctx.createBiquadFilter();
  zapFilt.type = 'lowpass';
  zapFilt.frequency.value = 2400;
  zapFilt.Q.value = 9;
  const zapEnv = envelope(ctx, t0 + 0.08, 0.34, 0.38);
  zap.connect(zapFilt);
  zapFilt.connect(zapEnv);
  zapEnv.connect(dest);
  zap.start(t0 + 0.08);
  zap.stop(t0 + 0.44);
  // Stutter retrigger — three quick square chirps for rave finish
  [0.46, 0.52, 0.58].forEach((d) => {
    beep(ctx, dest, t0 + d, 880, 0.045, 'square', 0.32);
  });
};

const playFire = (ctx: AudioContext, dest: AudioNode, t0: number): void => {
  // Initial boom hit — low sine + sub thump
  beep(ctx, dest, t0, 50, 0.18, 'sine', 0.5);
  const thump = ctx.createOscillator();
  thump.type = 'triangle';
  thump.frequency.setValueAtTime(85, t0);
  thump.frequency.exponentialRampToValueAtTime(40, t0 + 0.12);
  const thumpEnv = envelope(ctx, t0, 0.14, 0.42);
  thump.connect(thumpEnv);
  thumpEnv.connect(dest);
  thump.start(t0);
  thump.stop(t0 + 0.16);
  // Long roar — filter sweeps up then back down for a "breathing" flame
  const roarDur = 0.6;
  const roar = noiseSource(ctx, roarDur);
  const roarFilt = ctx.createBiquadFilter();
  roarFilt.type = 'lowpass';
  roarFilt.frequency.setValueAtTime(180, t0 + 0.04);
  roarFilt.frequency.linearRampToValueAtTime(1100, t0 + 0.34);
  roarFilt.frequency.linearRampToValueAtTime(450, t0 + 0.6);
  const roarEnv = envelope(ctx, t0 + 0.04, roarDur, 0.5);
  roar.connect(roarFilt);
  roarFilt.connect(roarEnv);
  roarEnv.connect(dest);
  roar.start(t0 + 0.04);
  roar.stop(t0 + 0.04 + roarDur + 0.02);
  // 5 crackle bursts scattered across the roar
  [0.12, 0.2, 0.3, 0.42, 0.55].forEach((delta) => {
    const t = t0 + delta;
    const nn = noiseSource(ctx, 0.03);
    const ff = ctx.createBiquadFilter();
    ff.type = 'highpass';
    ff.frequency.value = 2500;
    const gg = envelope(ctx, t, 0.03, 0.22);
    nn.connect(ff);
    ff.connect(gg);
    gg.connect(dest);
    nn.start(t);
    nn.stop(t + 0.04);
  });
};

const playGoal = (ctx: AudioContext, dest: AudioNode, t0: number): void => {
  // Quick referee whistle — short high square tweet
  beep(ctx, dest, t0, 2400, 0.09, 'square', 0.18);
  beep(ctx, dest, t0 + 0.04, 2200, 0.07, 'square', 0.14);
  // Two-blast stadium air horn (delayed so whistle leads)
  const blast = (start: number, freq: number, dur: number, peak: number) => {
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, start);
    osc.frequency.linearRampToValueAtTime(freq * 0.96, start + dur);
    const g = envelope(ctx, start, dur, peak, 0.01);
    osc.connect(g);
    g.connect(dest);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  };
  blast(t0 + 0.16, 220, 0.24, 0.32);
  blast(t0 + 0.46, 330, 0.42, 0.34);
  // Crowd cheer layered underneath — filtered noise with rising envelope
  const cheerDur = 0.95;
  const cheer = noiseSource(ctx, cheerDur);
  const cheerFilt = ctx.createBiquadFilter();
  cheerFilt.type = 'bandpass';
  cheerFilt.frequency.setValueAtTime(800, t0 + 0.16);
  cheerFilt.frequency.linearRampToValueAtTime(1800, t0 + 0.55);
  cheerFilt.Q.value = 2;
  const cheerGain = ctx.createGain();
  cheerGain.gain.setValueAtTime(0.0001, t0 + 0.16);
  cheerGain.gain.exponentialRampToValueAtTime(0.18, t0 + 0.45);
  cheerGain.gain.linearRampToValueAtTime(0.22, t0 + 0.75);
  cheerGain.gain.exponentialRampToValueAtTime(0.0001, t0 + cheerDur + 0.15);
  cheer.connect(cheerFilt);
  cheerFilt.connect(cheerGain);
  cheerGain.connect(dest);
  cheer.start(t0 + 0.16);
  cheer.stop(t0 + 0.16 + cheerDur + 0.05);
};

const playCake = (ctx: AudioContext, dest: AudioNode, t0: number): void => {
  // Party-horn TOOT — descending square wave (the unrolling paper kazoo)
  const horn = ctx.createOscillator();
  horn.type = 'square';
  horn.frequency.setValueAtTime(440, t0);
  horn.frequency.exponentialRampToValueAtTime(180, t0 + 0.28);
  const hornEnv = envelope(ctx, t0, 0.3, 0.28, 0.01);
  horn.connect(hornEnv);
  hornEnv.connect(dest);
  horn.start(t0);
  horn.stop(t0 + 0.32);
  // 3-note major triad arpeggio C-E-G with bell shimmer
  const notes = [523.25, 659.25, 783.99];
  notes.forEach((freq, i) => {
    const t = t0 + 0.36 + i * 0.13;
    beep(ctx, dest, t, freq, 0.22, 'triangle', 0.32);
    beep(ctx, dest, t, freq * 3, 0.16, 'sine', 0.08);
  });
  // Final celebratory bell ding (high C + octave shimmer)
  const ding = t0 + 0.8;
  beep(ctx, dest, ding, 1046.5, 0.4, 'sine', 0.3);
  beep(ctx, dest, ding, 2093, 0.3, 'sine', 0.11);
};

export const playPayload = (id: AnnouncementPayload): void => {
  const ctx = ensureCtx();
  const dest = master();
  if (!ctx || !dest) return;
  const t0 = safeNow(ctx);
  switch (id) {
    case 'confetti':
      return playConfetti(ctx, dest, t0);
    case 'gold':
      return playGold(ctx, dest, t0);
    case 'neon':
      return playNeon(ctx, dest, t0);
    case 'fire':
      return playFire(ctx, dest, t0);
    case 'goal':
      return playGoal(ctx, dest, t0);
    case 'cake':
      return playCake(ctx, dest, t0);
  }
};

// ── Intro tunnel: ambient hum (continuous), room engage thunk, ENTER chime ─

interface HumNodes {
  osc1: OscillatorNode;
  osc2: OscillatorNode;
  lfo: OscillatorNode;
  gain: GainNode;
}

let humNodes: HumNodes | null = null;

export const startIntroHum = (): void => {
  const ctx = ensureCtx();
  const dest = master();
  if (!ctx || !dest) return;
  if (humNodes) return; // already running

  const t0 = safeNow(ctx);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, t0);
  // Faster fade-in so the user notices the engine kick on within the
  // first half-second of scrolling.
  gain.gain.linearRampToValueAtTime(0.28, t0 + 0.45);

  const filt = ctx.createBiquadFilter();
  filt.type = 'lowpass';
  filt.frequency.value = 200;

  // Two slightly-detuned sines for a beating, breathing low rumble
  const osc1 = ctx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.value = 80;

  const osc2 = ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.value = 81;

  // Slow LFO modulating amplitude
  const lfo = ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 4;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.04;
  lfo.connect(lfoGain);
  lfoGain.connect(gain.gain);

  osc1.connect(filt);
  osc2.connect(filt);
  filt.connect(gain);
  gain.connect(dest);

  osc1.start(t0);
  osc2.start(t0);
  lfo.start(t0);

  humNodes = { osc1, osc2, lfo, gain };
};

export const stopIntroHum = (): void => {
  if (!humNodes) return;
  const ctx = ensureCtx();
  if (!ctx) {
    humNodes = null;
    return;
  }
  const t0 = safeNow(ctx);
  const { osc1, osc2, lfo, gain } = humNodes;
  gain.gain.cancelScheduledValues(t0);
  gain.gain.setValueAtTime(gain.gain.value, t0);
  gain.gain.linearRampToValueAtTime(0, t0 + 0.3);
  osc1.stop(t0 + 0.35);
  osc2.stop(t0 + 0.35);
  lfo.stop(t0 + 0.35);
  humNodes = null;
};

export const playRoomEngage = (): void => {
  const ctx = ensureCtx();
  const dest = master();
  if (!ctx || !dest) return;
  const t0 = safeNow(ctx);

  // Sine swoop down + light noise tail
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(150, t0);
  osc.frequency.exponentialRampToValueAtTime(50, t0 + 0.12);
  const g = envelope(ctx, t0, 0.15, 0.32);
  osc.connect(g);
  g.connect(dest);
  osc.start(t0);
  osc.stop(t0 + 0.18);

  const n = noiseSource(ctx, 0.04);
  const f = ctx.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = 400;
  const ng = envelope(ctx, t0, 0.04, 0.14);
  n.connect(f);
  f.connect(ng);
  ng.connect(dest);
  n.start(t0);
  n.stop(t0 + 0.05);
};

export const playEnterChime = (): void => {
  const ctx = ensureCtx();
  const dest = master();
  if (!ctx || !dest) return;
  const t0 = safeNow(ctx);
  // Bell-chord arpeggio: C5 E5 G5 C6 with shimmery harmonics
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((freq, i) => {
    const t = t0 + i * 0.06;
    beep(ctx, dest, t, freq, 0.55, 'triangle', 0.26);
    beep(ctx, dest, t, freq * 3, 0.4, 'sine', 0.07);
  });
};

// ── Mode flip transitions (TopBarMode toggle) ──────────────────────────────

const playFootballFlip = (ctx: AudioContext, dest: AudioNode, t0: number): void => {
  // Crowd "OOOH" rising — filtered noise envelope swelling up
  const cheerDur = 0.7;
  const cheer = noiseSource(ctx, cheerDur);
  const cheerFilt = ctx.createBiquadFilter();
  cheerFilt.type = 'bandpass';
  cheerFilt.frequency.setValueAtTime(550, t0);
  cheerFilt.frequency.linearRampToValueAtTime(1500, t0 + 0.45);
  cheerFilt.Q.value = 2.5;
  const cheerGain = ctx.createGain();
  cheerGain.gain.setValueAtTime(0.0001, t0);
  cheerGain.gain.exponentialRampToValueAtTime(0.22, t0 + 0.35);
  cheerGain.gain.exponentialRampToValueAtTime(0.0001, t0 + cheerDur);
  cheer.connect(cheerFilt);
  cheerFilt.connect(cheerGain);
  cheerGain.connect(dest);
  cheer.start(t0);
  cheer.stop(t0 + cheerDur + 0.05);
  // Stadium horn — single declarative blast
  const horn = ctx.createOscillator();
  horn.type = 'square';
  horn.frequency.setValueAtTime(280, t0 + 0.12);
  horn.frequency.linearRampToValueAtTime(268, t0 + 0.55);
  const hornEnv = envelope(ctx, t0 + 0.12, 0.45, 0.3, 0.012);
  horn.connect(hornEnv);
  hornEnv.connect(dest);
  horn.start(t0 + 0.12);
  horn.stop(t0 + 0.6);
};

const playGamingFlip = (ctx: AudioContext, dest: AudioNode, t0: number): void => {
  // Tech whoosh — high-to-low filtered noise sweep
  const whooshDur = 0.32;
  const whoosh = noiseSource(ctx, whooshDur);
  const whooshFilt = ctx.createBiquadFilter();
  whooshFilt.type = 'lowpass';
  whooshFilt.frequency.setValueAtTime(3200, t0);
  whooshFilt.frequency.exponentialRampToValueAtTime(220, t0 + 0.3);
  whooshFilt.Q.value = 2;
  const whooshEnv = envelope(ctx, t0, whooshDur, 0.32);
  whoosh.connect(whooshFilt);
  whooshFilt.connect(whooshEnv);
  whooshEnv.connect(dest);
  whoosh.start(t0);
  whoosh.stop(t0 + whooshDur + 0.02);
  // Descending synth zap underneath
  const zap = ctx.createOscillator();
  zap.type = 'sawtooth';
  zap.frequency.setValueAtTime(1300, t0 + 0.1);
  zap.frequency.exponentialRampToValueAtTime(180, t0 + 0.4);
  const zapEnv = envelope(ctx, t0 + 0.1, 0.32, 0.26);
  zap.connect(zapEnv);
  zapEnv.connect(dest);
  zap.start(t0 + 0.1);
  zap.stop(t0 + 0.44);
  // 8-bit pixel chirp finale — two rising blips
  beep(ctx, dest, t0 + 0.36, 880, 0.06, 'square', 0.26);
  beep(ctx, dest, t0 + 0.43, 1320, 0.06, 'square', 0.23);
};

// Dispatcher — TopBarMode flip handler calls this with the target mode.
export const playModeFlip = (target: 'gaming' | 'football'): void => {
  const ctx = ensureCtx();
  const dest = master();
  if (!ctx || !dest) return;
  const t0 = safeNow(ctx);
  if (target === 'football') playFootballFlip(ctx, dest, t0);
  else playGamingFlip(ctx, dest, t0);
};

// ── Stadium ambient (homepage, football mode only) ─────────────────────────

interface StadiumNodes {
  noise: AudioBufferSourceNode;
  lfo: OscillatorNode;
  gain: GainNode;
}

let stadiumNodes: StadiumNodes | null = null;
const STADIUM_PEAK = 0.09;
const STADIUM_FADE_IN_S = 1.5;
const STADIUM_FADE_OUT_S = 0.6;

export const startStadiumAmbient = (): void => {
  const ctx = ensureCtx();
  const dest = master();
  if (!ctx || !dest) return;
  if (stadiumNodes) return; // already running

  const t0 = safeNow(ctx);

  // 4-second noise buffer, looped — sounds like a continuous crowd murmur
  const loopSec = 4;
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * loopSec), ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buf;
  noise.loop = true;

  // Bandpass at the "human voice / crowd" frequency band
  const filt = ctx.createBiquadFilter();
  filt.type = 'bandpass';
  filt.frequency.value = 700;
  filt.Q.value = 0.7;

  // Slow LFO modulating filter freq for a breathing/swelling crowd
  const lfo = ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.18;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 220;
  lfo.connect(lfoGain);
  lfoGain.connect(filt.frequency);

  // Main gain — slow fade-in so the swap doesn't pop
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(STADIUM_PEAK, t0 + STADIUM_FADE_IN_S);

  noise.connect(filt);
  filt.connect(gain);
  gain.connect(dest);

  noise.start(t0);
  lfo.start(t0);

  stadiumNodes = { noise, lfo, gain };
};

export const stopStadiumAmbient = (): void => {
  if (!stadiumNodes) return;
  const ctx = ensureCtx();
  if (!ctx) {
    stadiumNodes = null;
    return;
  }
  const t0 = safeNow(ctx);
  const { noise, lfo, gain } = stadiumNodes;
  gain.gain.cancelScheduledValues(t0);
  gain.gain.setValueAtTime(gain.gain.value, t0);
  gain.gain.linearRampToValueAtTime(0, t0 + STADIUM_FADE_OUT_S);
  noise.stop(t0 + STADIUM_FADE_OUT_S + 0.05);
  lfo.stop(t0 + STADIUM_FADE_OUT_S + 0.05);
  stadiumNodes = null;
};
