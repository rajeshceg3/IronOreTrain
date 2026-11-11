// Browser wiring for the ore-railway soundscape. Everything audible is
// synthesized in oreSoundscape's buffers from pcm.ts: desert wind, diesel
// chug, rail-joint clacks, wagon creaks, shunting clanks, night crickets,
// and a rare far horn. No samples, no voice, no song, no melody. The mix
// follows the journey chapter. Nothing exists until the listener opts in;
// stopping closes the AudioContext.

import {
  mulberry,
  biquad,
  normalize,
  windBed,
  chugBed,
  clackVoice,
  creakVoice,
  clankVoice,
  chirpVoice,
  hornVoice,
  CHAPTER_MIX,
} from './pcm'

export interface OreSoundscape {
  start(chapter: number): Promise<void>
  setChapter(chapter: number): void
  stop(): void
  readonly running: boolean
}

export function createOreSoundscape(): OreSoundscape {
  let ctx: AudioContext | null = null
  let master: GainNode | null = null
  let windGain: GainNode | null = null
  let chugGain: GainNode | null = null
  let eventBus: GainNode | null = null
  let chugSource: AudioBufferSourceNode | null = null
  let windSource: AudioBufferSourceNode | null = null
  let timer: ReturnType<typeof setInterval> | null = null
  let chapter = 0
  let nextClack = 0
  let nextCreak = 0
  let nextClank = 0
  let nextChirp = 0
  let nextHorn = 0
  const rng = mulberry(20261111)

  function makeBuffer(pcm: Float32Array): AudioBuffer {
    const b = ctx!.createBuffer(1, pcm.length, ctx!.sampleRate)
    b.getChannelData(0).set(pcm)
    return b
  }

  function buildBeds() {
    const mix = CHAPTER_MIX[chapter]
    const sr = ctx!.sampleRate
    // Wind: filtered in JS before upload so the loop stays seamless and the
    // chapter gain means the same thing as in the offline previews.
    if (windSource) { try { windSource.stop() } catch { /* already stopped */ } }
    const wind = windBed(sr, 6, rng)
    biquad(wind, 'bandpass', mix.windBand, 0.5, sr)
    normalize(wind, 0.14)
    windSource = ctx!.createBufferSource()
    windSource.buffer = makeBuffer(wind)
    windSource.loop = true
    windSource.connect(windGain!)
    windSource.start()
    windGain!.gain.setTargetAtTime(mix.wind, ctx!.currentTime, 0.8)
    // Chug
    if (chugSource) { try { chugSource.stop() } catch { /* already stopped */ } }
    if (mix.chug > 0) {
      const chug = chugBed(sr, mix.chugRate, rng)
      biquad(chug, 'lowpass', mix.chug < 0.15 ? 300 : 700, 0.7, sr)
      normalize(chug, 0.15)
      chugSource = ctx!.createBufferSource()
      chugSource.buffer = makeBuffer(chug)
      chugSource.loop = true
      chugSource.connect(chugGain!)
      chugSource.start()
    }
    chugGain!.gain.setTargetAtTime(mix.chug, ctx!.currentTime, 0.8)
  }

  function scheduleEvents() {
    if (!ctx) return
    const mix = CHAPTER_MIX[chapter]
    const now = ctx.currentTime
    const ahead = now + 0.6
    if (nextClack < now) nextClack = now + 0.3
    if (mix.clacksPerMinute > 0) {
      while (nextClack < ahead) {
        play(clackVoice(ctx.sampleRate, rng, 0.7 + rng() * 0.5), mix.clackGain, nextClack)
        nextClack += 60 / mix.clacksPerMinute * (0.92 + rng() * 0.16)
      }
    } else nextClack = now + 0.3
    nextCreak = poisson(nextCreak, now, mix.creakMeanSeconds, () =>
      play(creakVoice(ctx!.sampleRate, rng, 0.7 + rng() * 0.6), mix.creakGain, nextCreak))
    nextClank = poisson(nextClank, now, mix.clankMeanSeconds, () =>
      play(clankVoice(ctx!.sampleRate, rng, 0.7 + rng() * 0.6), mix.clankGain, nextClank))
    nextChirp = poisson(nextChirp, now, mix.chirpMeanSeconds, () =>
      play(chirpVoice(ctx!.sampleRate, rng, 0.8), mix.chirpGain, nextChirp))
    nextHorn = poisson(nextHorn, now, mix.hornMeanSeconds, () =>
      play(hornVoice(ctx!.sampleRate, 1), mix.hornGain, nextHorn))
  }

  function poisson(next: number, now: number, mean: number, fire: () => void): number {
    if (mean <= 0) return now + 1e9
    if (next < now) next = now + 0.5 + rng() * mean
    if (next < now + 0.6) {
      fire()
      return next + mean * (0.5 + rng())
    }
    return next
  }

  function play(pcm: Float32Array, gainValue: number, when: number) {
    if (!ctx || !eventBus || gainValue <= 0) return
    const src = ctx.createBufferSource()
    src.buffer = makeBuffer(pcm)
    const g = ctx.createGain()
    g.gain.value = gainValue
    src.connect(g)
    g.connect(eventBus)
    src.start(when)
  }

  return {
    get running() { return !!ctx && ctx.state === 'running' },
    async start(ch: number) {
      if (ctx) return
      chapter = ch
      ctx = new AudioContext()
      master = ctx.createGain()
      master.gain.value = 0.25
      master.connect(ctx.destination)
      windGain = ctx.createGain()
      windGain.gain.value = 0
      windGain.connect(master)
      chugGain = ctx.createGain()
      chugGain.gain.value = 0
      chugGain.connect(master)
      eventBus = ctx.createGain()
      eventBus.connect(master)
      buildBeds()
      scheduleEvents()
      timer = setInterval(scheduleEvents, 250)
      await ctx.resume()
    },
    setChapter(ch: number) {
      chapter = ch
      if (!ctx) return
      buildBeds()
      nextCreak = 0; nextClank = 0; nextChirp = 0; nextHorn = 0; nextClack = 0
    },
    stop() {
      if (timer) { clearInterval(timer); timer = null }
      const c = ctx
      ctx = null
      if (c && c.state !== 'closed') void c.close()
      windSource = null; chugSource = null
      master = null; windGain = null; chugGain = null; eventBus = null
    },
  }
}
