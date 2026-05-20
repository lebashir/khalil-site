// All synthesized sounds for the app. Composed from primitive Web Audio
// nodes (oscillators + filtered noise + envelopes), routed through the
// engine's master gain so the mute toggle controls every sound source
// with a single ramp.

import type { AnnouncementPayload } from '@/lib/announcement';
import { ensureCtx, master } from './engine';

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
  const t0 = ctx.currentTime;

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
  // Bright shimmer noise
  const n = noiseSource(ctx, 0.14);
  const f = ctx.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = 4500;
  f.Q.value = 8;
  const g = envelope(ctx, t0, 0.12, 0.32);
  n.connect(f);
  f.connect(g);
  g.connect(dest);
  n.start(t0);
  n.stop(t0 + 0.16);
  // Stacked chirps
  [1200, 1600, 2000].forEach((freq, i) => {
    beep(ctx, dest, t0 + i * 0.04, freq, 0.08, 'triangle', 0.26);
  });
};

const playGold = (ctx: AudioContext, dest: AudioNode, t0: number): void => {
  // Descending major arpeggio + octave shimmer
  const notes = [880, 659.25, 523.25, 440];
  notes.forEach((freq, i) => {
    const t = t0 + i * 0.07;
    beep(ctx, dest, t, freq, 0.18, 'triangle', 0.36);
    beep(ctx, dest, t, freq * 2, 0.12, 'sine', 0.16);
  });
};

const playNeon = (ctx: AudioContext, dest: AudioNode, t0: number): void => {
  // Sawtooth pitch-sweep zap
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(1500, t0);
  osc.frequency.exponentialRampToValueAtTime(80, t0 + 0.3);
  const f = ctx.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = 2200;
  f.Q.value = 8;
  const g = envelope(ctx, t0, 0.3, 0.4);
  osc.connect(f);
  f.connect(g);
  g.connect(dest);
  osc.start(t0);
  osc.stop(t0 + 0.32);
  // Sub-octave square for body
  beep(ctx, dest, t0, 80, 0.3, 'square', 0.2);
};

const playFire = (ctx: AudioContext, dest: AudioNode, t0: number): void => {
  // Long filtered-noise whoosh
  const n = noiseSource(ctx, 0.42);
  const f = ctx.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.setValueAtTime(120, t0);
  f.frequency.linearRampToValueAtTime(900, t0 + 0.32);
  const g = envelope(ctx, t0, 0.4, 0.45);
  n.connect(f);
  f.connect(g);
  g.connect(dest);
  n.start(t0);
  n.stop(t0 + 0.44);
  // Crackle bursts
  [0.1, 0.18, 0.28].forEach((delta) => {
    const t = t0 + delta;
    const nn = noiseSource(ctx, 0.025);
    const ff = ctx.createBiquadFilter();
    ff.type = 'highpass';
    ff.frequency.value = 2000;
    const gg = envelope(ctx, t, 0.025, 0.18);
    nn.connect(ff);
    ff.connect(gg);
    gg.connect(dest);
    nn.start(t);
    nn.stop(t + 0.03);
  });
};

const playGoal = (ctx: AudioContext, dest: AudioNode, t0: number): void => {
  // Two-blast stadium air horn
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
  blast(t0, 220, 0.22, 0.28);
  blast(t0 + 0.3, 330, 0.4, 0.32);
};

const playCake = (ctx: AudioContext, dest: AudioNode, t0: number): void => {
  // 3-note major triad arpeggio + sustained top with vibrato
  const notes = [523.25, 659.25, 783.99];
  notes.forEach((freq, i) => {
    beep(ctx, dest, t0 + i * 0.13, freq, 0.2, 'triangle', 0.3);
  });
  // Hold the G with vibrato
  const t1 = t0 + 0.39;
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(783.99, t1);
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 6;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 12;
  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);
  const g = envelope(ctx, t1, 0.45, 0.28);
  osc.connect(g);
  g.connect(dest);
  lfo.start(t1);
  lfo.stop(t1 + 0.5);
  osc.start(t1);
  osc.stop(t1 + 0.5);
};

export const playPayload = (id: AnnouncementPayload): void => {
  const ctx = ensureCtx();
  const dest = master();
  if (!ctx || !dest) return;
  const t0 = ctx.currentTime;
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

  const t0 = ctx.currentTime;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(0.18, t0 + 1.2);

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
  const t0 = ctx.currentTime;
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
  const t0 = ctx.currentTime;

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
  const t0 = ctx.currentTime;
  // Bell-chord arpeggio: C5 E5 G5 C6 with shimmery harmonics
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((freq, i) => {
    const t = t0 + i * 0.06;
    beep(ctx, dest, t, freq, 0.55, 'triangle', 0.26);
    beep(ctx, dest, t, freq * 3, 0.4, 'sine', 0.07);
  });
};
