const fs = require('fs'),
  assert = require('assert'),
  { spawn } = require('child_process')
let pp
try {
  pp = require('puppeteer-core')
} catch {
  pp = require('/home/sandbox/appalachiantrail/node_modules/puppeteer-core')
}
;(async () => {
  const root = require('path').resolve(__dirname, '..'),
    dir = process.env.OUT || root + '/verification/output'
  fs.mkdirSync(dir, { recursive: true })
  let b, s
  const proof = []
  try {
    if (!process.env.URL) {
      s = spawn('python3', ['-m', 'http.server', '8820'], {
        cwd: root + '/apps/web/out',
        stdio: 'ignore',
      })
      await new Promise((r) => setTimeout(r, 350))
    }
    b = await pp.launch({
      executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome',
      headless: true,
      args: ['--no-sandbox', '--enable-unsafe-swiftshader'],
    })
    for (const width of (process.env.WIDTHS || '320,390,1440')
      .split(',')
      .map(Number)) {
      const p = await b.newPage()
      await p.setViewport({ width, height: 844 })
      const errors = []
      p.on('pageerror', (e) => errors.push(e.message))
      const motion = process.env.MOTION === 'true'
      await p.emulateMediaFeatures([
        {
          name: 'prefers-reduced-motion',
          value: motion ? 'no-preference' : 'reduce',
        },
      ])
      if (process.env.PINNED !== '0')
        await p.evaluateOnNewDocument(() => {
          try { localStorage.setItem('ironore-chrome-pin', '1') } catch {}
        })
      await p.evaluateOnNewDocument(() => {
        window.__contexts = []
        const AC = window.AudioContext
        window.AudioContext = class extends AC {
          constructor(...args) {
            super(...args)
            window.__contexts.push(this)
          }
        }
      })
      await p.goto(process.env.URL || 'http://127.0.0.1:8820', {
        waitUntil: 'networkidle0',
      })
      await p.waitForSelector('canvas[data-camera]')
      assert.equal(await p.$eval('h1', (e) => e.textContent), 'Iron & sand')
      assert.equal(await p.$$eval('[data-chapter]', (es) => es.length), 7)
      assert.equal(await p.evaluate(() => window.__contexts.length), 0)
      for (const dark of [false, true]) {
        if (dark) await p.click('.settings button:nth-child(3)')
        for (let i = 0; i < 7; i++) {
          await p.click('[data-chapter="' + i + '"]')
          await new Promise((r) => setTimeout(r, 100))
          const base = await p.$eval('canvas', (e) => e.dataset.camera)
          const r = await p.$eval('canvas', (e) => {
            const r = e.getBoundingClientRect()
            return { x: r.x, y: r.y, w: r.width, h: r.height }
          })
          await p.mouse.move(r.x + r.w * 0.4, r.y + r.h * 0.45)
          await p.mouse.down()
          await p.mouse.move(r.x + r.w * 0.75, r.y + r.h * 0.55, { steps: 6 })
          await p.mouse.up()
          const moved = await p.$eval('canvas', (e) => e.dataset.camera)
          assert.notEqual(moved, base, 'drag')
          await p.click('.transport button:last-child')
          const reset = await p.$eval('canvas', (e) => e.dataset.camera)
          assert.equal(reset, base, 'reset')
          await new Promise((r) => setTimeout(r, 150))
          assert.equal(
            await p.$eval('canvas', (e) => e.dataset.camera),
            base,
            'reset holds',
          )
          await p.focus('canvas')
          await p.keyboard.press('ArrowRight')
          assert.notEqual(
            await p.$eval('canvas', (e) => e.dataset.camera),
            base,
            'keyboard rotation',
          )
          await p.keyboard.press('Home')
          assert.equal(
            await p.$eval('canvas', (e) => e.dataset.camera),
            base,
            'Home reset',
          )
          const floor = await p.evaluate(() => ({
            overflow:
              document.documentElement.scrollWidth > innerWidth ||
              document.documentElement.scrollHeight > innerHeight,
            minFont: Math.min(
              ...[
                ...document.querySelectorAll(
                  'button,select,p,a,label,span',
                ),
              ]
                .filter((e) => e.getClientRects().length)
                .map((e) => parseFloat(getComputedStyle(e).fontSize)),
            ),
            sceneHeight: document.querySelector('canvas').clientHeight,
          }))
          assert(!floor.overflow, JSON.stringify(floor))
          assert(floor.minFont >= 14, JSON.stringify(floor))
          assert(floor.sceneHeight >= 200)
          const name = `${width}-${motion ? 'moving' : 'paused'}-${dark ? 'dark' : 'light'}-${i}`
          await p.screenshot({ path: dir + '/' + name + '.png' })
          proof.push({
            name,
            drag: true,
            reset: true,
            keyboard: true,
            ...floor,
          })
          assert.deepEqual(errors, [])
        }
        if (dark) await p.click('.settings button:nth-child(3)')
      }
      await p.click('.settings button:nth-child(4)')
      assert(!(await p.$('.chapter-story p')))
      await p.click('.settings button:nth-child(4)')
      await p.click('[aria-label="Next chapter"]')
      await p.click('[aria-label="Previous chapter"]')
      await p.click('.settings button:first-child')
      await p.click('.settings button:first-child')
      await p.click('.settings button:nth-child(2)')
      await p.waitForFunction(
        () => window.__contexts.at(-1)?.state === 'running',
      )
      await p.click('.settings button:nth-child(2)')
      await p.waitForFunction(
        () => window.__contexts.at(-1)?.state === 'closed',
      )
      await p.click('.settings button:nth-child(2)')
      await p.waitForFunction(
        () => window.__contexts.at(-1)?.state === 'running',
      )
      await p.click('.settings button:nth-child(2)')
      await p.waitForFunction(
        () => window.__contexts.at(-1)?.state === 'closed',
      )
      if (process.env.QUIET !== '0') {
        const q = await b.newPage()
        await q.evaluateOnNewDocument(() => { try { localStorage.removeItem('ironore-chrome-pin') } catch {} })
        await q.setViewport({ width, height: 844 })
        const qerr = []
        q.on('pageerror', (e) => qerr.push(e.message))
        await q.goto(process.env.URL || 'http://127.0.0.1:8820', { waitUntil: 'networkidle0' })
        await q.waitForSelector('canvas[data-camera]')
        await new Promise((r) => setTimeout(r, 3400))
        assert.equal(await q.$eval('.train-header', (e) => getComputedStyle(e).visibility), 'hidden', 'chrome retired after greeting')
        assert.ok(await q.$('.chrome-hint'), 'hint appears when chrome retires')
        await q.screenshot({ path: dir + '/' + width + '-quiet.png' })
        await q.click('.chrome-hint')
        await new Promise((r) => setTimeout(r, 300))
        assert.equal(await q.$eval('.train-header', (e) => getComputedStyle(e).visibility), 'visible', 'hint wakes chrome')
        await q.screenshot({ path: dir + '/' + width + '-woken.png' })
        await q.keyboard.press('Escape')
        await new Promise((r) => setTimeout(r, 500))
        assert.equal(await q.$eval('.train-header', (e) => getComputedStyle(e).visibility), 'hidden', 'Escape retires chrome')
        assert.deepEqual(qerr, [])
        await q.close()
      }
      assert.deepEqual(errors, [])
      await p.close()
      console.log(
        'PASS',
        width,
        14,
        'states, drag/reset, keyboard, floors, audio opt-in/off/replay',
      )
    }
    fs.writeFileSync(dir + '/proof.json', JSON.stringify(proof, null, 2))
  } finally {
    await b?.close()
    s?.kill()
  }
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
