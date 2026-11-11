// Pure-PCM voices for the Mauritania ore railway. No samples, no voice, no
// melody: desert wind, diesel chug, rail-joint clacks, wagon creaks and
// shunting clanks, sparse night crickets, and a rare far horn. The browser
// wiring (oreSoundscape.ts) and the offline preview renderer both use these
// exact functions, so the preview files are the real synthesis.

export function mulberry(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Crossfade the tail into the head so a looped buffer has no seam click.
export function foldLoop(a: Float32Array, fadeSeconds: number, sr: number): void {
  const n = Math.min(Math.floor(fadeSeconds * sr), Math.floor(a.length / 2))
  for (let i = 0; i < n; i++) {
    const t = i / n
    const head = a[i]
    const tail = a[a.length - n + i]
    a[i] = head * t + tail * (1 - t)
    a[a.length - n + i] = tail * t + head * (1 - t)
  }
}

export function rms(a: Float32Array): number {
  let s = 0
  for (let i = 0; i < a.length; i++) s += a[i] * a[i]
  return Math.sqrt(s / a.length)
}

export function normalize(a: Float32Array, target: number): void {
  const r = rms(a) || 1
  const k = target / r
  for (let i = 0; i < a.length; i++) a[i] = Math.tanh(a[i] * k)
}

// Desert wind bed: brown noise, seamless. Browser applies a bandpass on top.
export function windBed(sr: number, seconds: number, rng: () => number): Float32Array {
  const n = Math.floor(sr * seconds)
  const a = new Float32Array(n)
  let last = 0
  for (let i = 0; i < n; i++) {
    last = (last + (rng() * 2 - 1) * 0.02) / 1.02
    a[i] = last * 3.5
  }
  // slow gusts baked in
  for (let i = 0; i < n; i++) {
    const t = i / sr
    const g = 0.7 + 0.3 * Math.sin(2 * Math.PI * 0.06 * t + 1.3) * Math.sin(2 * Math.PI * 0.023 * t)
    a[i] *= g
  }
  foldLoop(a, 0.5, sr)
  normalize(a, 0.14)
  return a
}

// RBJ biquad applied in-place to a buffer; browser wiring and previews both
// filter before uploading so gains mean the same thing everywhere.
export function biquad(a: Float32Array, type: 'bandpass' | 'lowpass', f: number, Q: number, sr: number): void {
  const w = 2 * Math.PI * f / sr, alpha = Math.sin(w) / (2 * Q), c = Math.cos(w)
  let b0: number, b1: number, b2: number
  if (type === 'bandpass') { b0 = alpha; b1 = 0; b2 = -alpha } else { b0 = (1 - c) / 2; b1 = 1 - c; b2 = (1 - c) / 2 }
  const a0 = 1 + alpha, a1 = -2 * c, a2 = 1 - alpha
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0
  for (let i = 0; i < a.length; i++) {
    const x = a[i]
    const y = (b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0
    a[i] = y; x2 = x1; x1 = x; y2 = y1; y1 = y
  }
}

// Diesel chug loop: soft exhaust bursts over a low thump, seamless loop at a
// fixed cadence. chugsPerSecond ~2.6 under load, ~1.3 at idle.
export function chugBed(sr: number, chugsPerSecond: number, rng: () => number): Float32Array {
  const period = 1 / chugsPerSecond
  const loops = 8
  const n = Math.floor(sr * period * loops)
  const a = new Float32Array(n)
  for (let c = 0; c < loops; c++) {
    const start = Math.floor(c * period * sr)
    const burst = Math.floor(sr * 0.14)
    let last = 0
    const vel = 0.85 + rng() * 0.3
    for (let i = 0; i < burst && start + i < n; i++) {
      const t = i / sr
      last = (last + (rng() * 2 - 1) * 0.05) / 1.05
      const env = Math.exp(-t * 26)
      a[start + i] += last * 4 * env * vel
      a[start + i] += Math.sin(2 * Math.PI * 52 * t) * 0.5 * Math.exp(-t * 30) * vel
    }
  }
  foldLoop(a, 0.06, sr)
  normalize(a, 0.15)
  return a
}

// One rail-joint clack: a paired bogie knock (two thumps ~0.13s apart).
export function clackVoice(sr: number, rng: () => number, velocity: number): Float32Array {
  const n = Math.floor(sr * 0.34)
  const a = new Float32Array(n)
  for (const offset of [0, Math.floor(sr * (0.125 + rng() * 0.02))]) {
    const thump = Math.floor(sr * 0.09)
    for (let i = 0; i < thump && offset + i < n; i++) {
      const t = i / sr
      const knock = Math.sin(2 * Math.PI * (84 + rng() * 10) * t) * Math.exp(-t * 48)
      const click = (rng() * 2 - 1) * Math.exp(-t * 240) * 0.7
      a[offset + i] += (knock + click) * velocity
    }
  }
  normalize(a, 0.18)
  return a
}

// Wagon steel creak/groan: a slow inharmonic sweep with fast wobble.
export function creakVoice(sr: number, rng: () => number, velocity: number): Float32Array {
  const dur = 0.7 + rng() * 0.8
  const n = Math.floor(sr * dur)
  const a = new Float32Array(n)
  const f0 = 150 + rng() * 90
  const f1 = f0 * (0.6 + rng() * 0.25)
  const wob = 6 + rng() * 9
  for (let i = 0; i < n; i++) {
    const t = i / sr
    const p = t / dur
    const f = f0 + (f1 - f0) * p
    const env = Math.sin(Math.PI * p) ** 1.5
    const am = 0.6 + 0.4 * Math.sin(2 * Math.PI * wob * t)
    a[i] = (Math.sin(2 * Math.PI * f * t) * 0.7 + Math.sin(2 * Math.PI * f * 2.7 * t) * 0.2) * env * am * velocity
  }
  normalize(a, 0.1)
  return a
}

// Yard shunting clank: a metallic strike with a couple of partials.
export function clankVoice(sr: number, rng: () => number, velocity: number): Float32Array {
  const n = Math.floor(sr * 0.6)
  const a = new Float32Array(n)
  const base = 480 + rng() * 220
  const partials = [1, 2.76, 5.4]
  for (let i = 0; i < n; i++) {
    const t = i / sr
    let v = 0
    for (let k = 0; k < partials.length; k++) {
      v += Math.sin(2 * Math.PI * base * partials[k] * t) * Math.exp(-t * (14 + k * 18)) / (k + 1)
    }
    v += (rng() * 2 - 1) * Math.exp(-t * 300) * 0.5
    a[i] = v * velocity
  }
  normalize(a, 0.14)
  return a
}

// Sparse night cricket: a short high chirp group, kept very quiet in the mix.
export function chirpVoice(sr: number, rng: () => number, velocity: number): Float32Array {
  const n = Math.floor(sr * 0.5)
  const a = new Float32Array(n)
  const f = 4200 + rng() * 600
  const pulses = 3 + Math.floor(rng() * 3)
  for (let p = 0; p < pulses; p++) {
    const start = Math.floor(p * sr * 0.11)
    const len = Math.floor(sr * 0.05)
    for (let i = 0; i < len && start + i < n; i++) {
      const t = i / sr
      const env = Math.sin(Math.PI * (i / len))
      a[start + i] = Math.sin(2 * Math.PI * f * t) * env * velocity
    }
  }
  normalize(a, 0.08)
  return a
}

// A far locomotive horn carried on the wind: two low detuned sines, one slow
// swell, heavily softened. A sound of the place, not a tune.
export function hornVoice(sr: number, velocity: number): Float32Array {
  const dur = 2.4
  const n = Math.floor(sr * dur)
  const a = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const t = i / sr
    const p = t / dur
    const env = Math.sin(Math.PI * Math.min(1, p * 1.15)) ** 2
    a[i] = (Math.sin(2 * Math.PI * 164 * t) + Math.sin(2 * Math.PI * 196 * t) * 0.8) * env * velocity
  }
  normalize(a, 0.12)
  return a
}

export interface ChapterMix {
  wind: number
  windBand: number
  chug: number
  chugRate: number
  clackGain: number
  clacksPerMinute: number
  creakGain: number
  creakMeanSeconds: number
  clankGain: number
  clankMeanSeconds: number
  chirpGain: number
  chirpMeanSeconds: number
  hornGain: number
  hornMeanSeconds: number
}

// Per-chapter mixes along the line from the mine to the port.
export const CHAPTER_MIX: ChapterMix[] = [
  // Arrival: standing wagons in the yard; wind, far shunting.
  { wind: 0.6, windBand: 620, chug: 0, chugRate: 1.3, clackGain: 0, clacksPerMinute: 0, creakGain: 0.35, creakMeanSeconds: 9, clankGain: 0.3, clankMeanSeconds: 14, chirpGain: 0, chirpMeanSeconds: 0, hornGain: 0.1, hornMeanSeconds: 75 },
  // Orientation: open desert, the train far off.
  { wind: 0.65, windBand: 760, chug: 0.08, chugRate: 2.2, clackGain: 0.12, clacksPerMinute: 44, creakGain: 0, creakMeanSeconds: 0, clankGain: 0, clankMeanSeconds: 0, chirpGain: 0, chirpMeanSeconds: 0, hornGain: 0.08, hornMeanSeconds: 90 },
  // Boarding: beside and inside the hopper; wind over steel, creaks near.
  { wind: 0.38, windBand: 520, chug: 0.1, chugRate: 1.3, clackGain: 0, clacksPerMinute: 0, creakGain: 0.55, creakMeanSeconds: 5, clankGain: 0.25, clankMeanSeconds: 22, chirpGain: 0, chirpMeanSeconds: 0, hornGain: 0, hornMeanSeconds: 0 },
  // Exploration: rolling with the train.
  { wind: 0.55, windBand: 640, chug: 0.5, chugRate: 2.6, clackGain: 0.5, clacksPerMinute: 92, creakGain: 0.2, creakMeanSeconds: 12, clankGain: 0, clankMeanSeconds: 0, chirpGain: 0, chirpMeanSeconds: 0, hornGain: 0.1, hornMeanSeconds: 60 },
  // Discovery: close to the wheelsets and couplers.
  { wind: 0.45, windBand: 560, chug: 0.45, chugRate: 2.6, clackGain: 0.7, clacksPerMinute: 92, creakGain: 0.5, creakMeanSeconds: 6, clankGain: 0.12, clankMeanSeconds: 26, chirpGain: 0, chirpMeanSeconds: 0, hornGain: 0, hornMeanSeconds: 0 },
  // Night: still air, crickets, the loco idling far away, a rare far horn.
  { wind: 0.38, windBand: 330, chug: 0.15, chugRate: 1.3, clackGain: 0, clacksPerMinute: 0, creakGain: 0.1, creakMeanSeconds: 18, clankGain: 0, clankMeanSeconds: 0, chirpGain: 0.22, chirpMeanSeconds: 5, hornGain: 0.1, hornMeanSeconds: 50 },
  // Reflection: wide land, the train receding toward the port.
  { wind: 0.5, windBand: 700, chug: 0.06, chugRate: 2.2, clackGain: 0.08, clacksPerMinute: 44, creakGain: 0, creakMeanSeconds: 0, clankGain: 0, clankMeanSeconds: 0, chirpGain: 0, chirpMeanSeconds: 0, hornGain: 0.07, hornMeanSeconds: 100 },
]
