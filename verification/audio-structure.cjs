// Structural checks on the rendered previews: no clipping, quiet-ambient RMS
// window, no DC offset; seamless-loop check on the raw wind and chug beds.
const fs = require('fs'), assert = require('assert')
const { execSync } = require('child_process')
function resolveOut() {
  if (process.env.AUDIO_OUT) return process.env.AUDIO_OUT
  try { fs.mkdirSync('/downloads/ore-audio', { recursive: true }); return '/downloads/ore-audio' } catch { return 'verification/output/ore-audio' }
}
const AOUT = resolveOut()
if (!fs.existsSync(AOUT + '/ore-night.wav'))
  execSync('node --experimental-strip-types scripts/render-preview.mjs', { stdio: 'inherit' })
function wav(path) {
  const b = fs.readFileSync(path)
  const n = (b.length - 44) / 2, a = new Float32Array(n)
  for (let i = 0; i < n; i++) a[i] = b.readInt16LE(44 + i * 2) / 32768
  return a
}
const rms = a => Math.sqrt(a.reduce((s, x) => s + x * x, 0) / a.length)
const files = fs.readdirSync(AOUT).filter(f => f.endsWith('.wav'))
assert.equal(files.length, 7, '7 chapter previews')
const out = {}
for (const f of files) {
  const a = wav(AOUT + '/' + f)
  let peak = 0, dc = 0
  for (let i = 0; i < a.length; i++) { peak = Math.max(peak, Math.abs(a[i])); dc += a[i] }
  dc /= a.length
  const db = 20 * Math.log10(rms(a))
  assert(peak < 0.98, f + ' clipping')
  assert(Math.abs(dc) < 0.005, f + ' DC offset')
  assert(db > -40 && db < -14, f + ' loudness ' + db.toFixed(1))
  out[f] = { rmsDb: +db.toFixed(1), peak: +peak.toFixed(3) }
}
// Seam check on the raw beds via the shared PCM module.
const seamFile = 'verification/output/.seam-check.mjs'
fs.mkdirSync('verification/output', { recursive: true })
fs.writeFileSync(seamFile, `const m = await import(${JSON.stringify(process.cwd() + '/packages/engine/src/sound/pcm.ts')})
const sr = 44100, rng = m.mulberry(1)
for (const [name, bed] of [['wind', m.windBed(sr, 6, rng)], ['chug', m.chugBed(sr, 2.6, rng)]]) {
  const w = Math.floor(sr * 0.05)
  let wrapMax = 0
  const dense = []
  for (let i = 0; i < w; i++) wrapMax = Math.max(wrapMax, Math.abs(bed[bed.length - w + i] - bed[i]))
  for (let i = 0; i < bed.length - w; i += 97) dense.push(Math.abs(bed[i + w] - bed[i]))
  dense.sort((x, y) => x - y)
  const p99 = dense[Math.floor(dense.length * 0.99)]
  const rms = a => Math.sqrt(a.reduce((s, x) => s + x * x, 0) / a.length)
  const ratio = rms(bed.slice(0, w)) / (rms(bed.slice(bed.length - w)) || 1)
  if (!(wrapMax <= p99 * 3 && ratio > 0.4 && ratio < 2.5)) { console.error('SEAM FAIL', name, wrapMax, p99, ratio); process.exit(1) }
}
console.log('PASS beds seamless')`)
execSync(`node --experimental-strip-types ${seamFile}`, { stdio: 'inherit' })
fs.mkdirSync('verification/output', { recursive: true })
fs.writeFileSync('verification/output/audio-structure.json', JSON.stringify({ checked: new Date().toISOString(), files: out, note: 'structural only: levels, clipping, DC, loop seams; not a judgement of how it sounds' }, null, 2))
console.log('PASS audio-structure', JSON.stringify(out))
