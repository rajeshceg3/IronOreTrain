// Offline render of the exact oreSoundscape synthesis (packages/engine/src/sound/pcm.ts)
// to WAV previews per journey chapter. Run: node --experimental-strip-types scripts/render-preview.mjs
import { writeFileSync, mkdirSync } from 'fs'
const pcm = await import('../packages/engine/src/sound/pcm.ts')
const SR = 44100, SECONDS = 45, MASTER = 0.25
function resolveOut() {
  if (process.env.AUDIO_OUT) return process.env.AUDIO_OUT
  try { mkdirSync('/downloads/ore-audio', { recursive: true }); return '/downloads/ore-audio' } catch { return 'verification/output/ore-audio' }
}
const OUT = resolveOut()

function loopInto(dest, bed, gain) {
  for (let i = 0; i < dest.length; i++) dest[i] += bed[i % bed.length] * gain
}

function place(dest, voice, at, gain) {
  const s = Math.floor(at * SR)
  for (let i = 0; i < voice.length && s + i < dest.length; i++) dest[s + i] += voice[i] * gain
}

const names = ['arrival', 'orientation', 'boarding', 'exploration', 'discovery', 'night', 'reflection']
mkdirSync(OUT, { recursive: true })
for (let c = 0; c < 7; c++) {
  const mix = pcm.CHAPTER_MIX[c]
  const rng = pcm.mulberry(20261111)
  const out = new Float32Array(SR * SECONDS)
  const wind = pcm.windBed(SR, 6, rng)
  pcm.biquad(wind, 'bandpass', mix.windBand, 0.5, SR)
  pcm.normalize(wind, 0.14)
  loopInto(out, wind, mix.wind)
  if (mix.chug > 0) { const chug = pcm.chugBed(SR, mix.chugRate, rng); pcm.biquad(chug, 'lowpass', mix.chug < 0.15 ? 300 : 700, 0.7, SR); pcm.normalize(chug, 0.15); loopInto(out, chug, mix.chug) }
  let t = 0.3
  if (mix.clacksPerMinute > 0) while (t < SECONDS - 1) {
    place(out, pcm.clackVoice(SR, rng, 0.7 + rng() * 0.5), t, mix.clackGain)
    t += (60 / mix.clacksPerMinute) * (0.92 + rng() * 0.16)
  }
  const events = [
    [mix.creakMeanSeconds, mix.creakGain, () => pcm.creakVoice(SR, rng, 0.7 + rng() * 0.6)],
    [mix.clankMeanSeconds, mix.clankGain, () => pcm.clankVoice(SR, rng, 0.7 + rng() * 0.6)],
    [mix.chirpMeanSeconds, mix.chirpGain, () => pcm.chirpVoice(SR, rng, 0.8)],
    [mix.hornMeanSeconds, mix.hornGain, () => pcm.hornVoice(SR, 1)],
  ]
  for (const [mean, gain, make] of events) {
    if (mean <= 0 || gain <= 0) continue
    let et = 0.5 + rng() * mean
    while (et < SECONDS - 3) { place(out, make(), et, gain); et += mean * (0.5 + rng()) }
  }
  for (let i = 0; i < out.length; i++) out[i] = Math.tanh(out[i] * MASTER)
  const bytes = new DataView(new ArrayBuffer(44 + out.length * 2))
  const ws = (o, s) => { for (let i = 0; i < s.length; i++) bytes.setUint8(o + i, s.charCodeAt(i)) }
  ws(0, 'RIFF'); bytes.setUint32(4, 36 + out.length * 2, true); ws(8, 'WAVE'); ws(12, 'fmt ')
  bytes.setUint32(16, 16, true); bytes.setUint16(20, 1, true); bytes.setUint16(22, 1, true)
  bytes.setUint32(24, SR, true); bytes.setUint32(28, SR * 2, true); bytes.setUint16(32, 2, true)
  bytes.setUint16(34, 16, true); ws(36, 'data'); bytes.setUint32(40, out.length * 2, true)
  for (let i = 0; i < out.length; i++) bytes.setInt16(44 + i * 2, Math.max(-1, Math.min(1, out[i])) * 32767, true)
  writeFileSync(`${OUT}/ore-${names[c]}.wav`, Buffer.from(bytes.buffer))
}
console.log('PASS rendered 7 chapter previews to ' + OUT)
