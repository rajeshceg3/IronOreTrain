// Captures the app's real post-gain audio for three chapters and verifies
// silent start, opt-in, off, and replay. Needs apps/web/out (pnpm build).
const fs = require('fs'), assert = require('assert'), { spawn } = require('child_process')
let pp
try { pp = require('puppeteer-core') } catch { pp = require('/home/sandbox/appalachiantrail/node_modules/puppeteer-core') }
;(async () => {
  const root = require('path').resolve(__dirname, '..')
  let b, s
  try {
    s = spawn('python3', ['-m', 'http.server', '8821'], { cwd: root + '/apps/web/out', stdio: 'ignore' })
    await new Promise(r => setTimeout(r, 400))
    b = await pp.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox', '--enable-unsafe-swiftshader'] })
    const p = await b.newPage()
    await p.setViewport({ width: 390, height: 844 })
    await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
    await p.evaluateOnNewDocument(() => {
      window.__contexts = []
      const AC = window.AudioContext
      window.AudioContext = class extends AC {
        constructor(...a) { super(...a); window.__contexts.push(this) }
      }
      const c = AudioNode.prototype.connect
      AudioNode.prototype.connect = function (d, ...a) {
        const r = c.call(this, d, ...a)
        if (d instanceof AudioDestinationNode) {
          if (!this.context.__tee) this.context.__tee = this.context.createMediaStreamDestination()
          window.__tee = this.context.__tee
          c.call(this, this.context.__tee)
        }
        return r
      }
    })
    await p.goto('http://127.0.0.1:8821', { waitUntil: 'networkidle0' })
    await p.waitForSelector('canvas[data-camera]')
    assert.equal(await p.evaluate(() => window.__contexts.length), 0, 'silent start')
    await p.click('.settings button:nth-child(2)')
    await p.waitForFunction(() => window.__contexts.at(-1)?.state === 'running')
    const evidence = []
    for (const ch of [0, 4, 5]) {
      await p.select('select', '' + ch)
      await new Promise(r => setTimeout(r, 2600))
      const bytes = await p.evaluate(async () => {
        const chunks = [], r = new MediaRecorder(window.__tee.stream)
        r.ondataavailable = e => chunks.push(e.data)
        const done = new Promise(ok => (r.onstop = ok))
        r.start(); await new Promise(ok => setTimeout(ok, 4000)); r.stop(); await done
        return [...new Uint8Array(await new Blob(chunks, { type: r.mimeType }).arrayBuffer())]
      })
      fs.mkdirSync(process.env.AUDIO_OUT || '/downloads/ore-audio', { recursive: true })
      fs.writeFileSync((process.env.AUDIO_OUT || '/downloads/ore-audio') + '/ore-app-ch' + ch + '.webm', Buffer.from(bytes))
      evidence.push({ chapter: ch, bytes: bytes.length })
    }
    await p.click('.settings button:nth-child(2)')
    await p.waitForFunction(() => window.__contexts.at(-1)?.state === 'closed')
    await p.click('.settings button:nth-child(2)')
    await p.waitForFunction(() => window.__contexts.at(-1)?.state === 'running')
    await p.click('.settings button:nth-child(2)')
    await p.waitForFunction(() => window.__contexts.at(-1)?.state === 'closed')
    fs.writeFileSync('verification/output/audio.json', JSON.stringify({ silentStart: true, offAndReplay: true, captures: evidence, capture: 'actual post-gain Web Audio output; synthesized ore-railway ambience', humanListening: false, sound: 'synthesized desert wind, diesel chug, rail clacks, wagon creaks, night crickets, far horn; no voice, no melody, not a field recording' }, null, 2))
    console.log('PASS ore ambience captured for chapters 0/4/5, off and replay, silent start')
  } finally { await b?.close(); s?.kill() }
})().catch(e => { console.error(e); process.exit(1) })
