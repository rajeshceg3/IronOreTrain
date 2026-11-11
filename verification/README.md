# Train journey verification

The shipped entry point is `packages/engine/src/WorldExperience.tsx`. The old automatic wheel-gated experiment remains in the other engine modules for reference and for its existing 49 unit tests; those tests are not evidence of the new UI. The new UI is tested with real Chromium by `check.cjs`.

## Repair scope

- Seven original phase names remain directly selectable. No long black introduction, hidden wheel gesture or automatic advance.
- 360 OrbitControls, wheel/pinch zoom, keyboard arrows and Home. Reset disposes the previous control instance and restores the chapter's exact position/target, without residual velocity.
- Open hopper train: ore load, braced sides, bogies/wheelsets, couplers, locomotive, rails and sleepers. All geometry is original procedural illustration, not a model of a specific SNIM locomotive or route survey.
- Responsive cream/dark UI. No eyebrow text or small tracked caps. All text at least 14px.
- Generated sound is off until the Sound on button, with disposal and replay. This is not a recording of Mauritania. Motion is drifting dust, not a moving-train simulation.
- Static Next export: `pnpm build` produces `apps/web/out`, suitable for free Cloudflare Pages. Build from GitHub; no server secrets or paid services.

## Executed locally, 2026-11-11

- `pnpm build`: pass.
- `pnpm test`: 14 files, 49 tests pass. Legacy-module scope noted above.
- `pnpm audit`: zero advisories after dependency updates and explicit patched transitive versions.
- `node verification/check.cjs`: all seven phases x 320/390/1440 x both UI themes; repeated with normal and reduced motion preferences. 84 states pass real drag/reset, keyboard rotation/Home, min font, no document overflow and no page errors. Details/source disclosure, notes hide/show, next/previous, sound opt-in/off/replay also pass.
- `contrast.json`: 200 visible glyph-mask samples of the actual rendered text/backdrop at 2x DPR, minimum 7.2767:1. Clipped content excluded. Light/dark, closed/open source panel, phone and desktop. Threshold 4.5:1. Mask capture used black/white text at fixed rendering to identify glyph interiors, not average background sampling.
- Actual 14-second browser audio output recorded; context silent before opt-in, closed on off, replay running then closed. Subjective listening has not been signed off.
- Actual phone and desktop pixels inspected before push. Complete screenshots are produced by the Chromium test, not committed wholesale.

## Grounded content

SNIM annual report 2023: over-700km company railway and mine-to-Nouadhibou operating chain.
https://snim.com/sites/default/files/SNIM-Annual%20report%202023_En.pdf

EIB: SNIM-owned railway linking the mining area of Zouérat with the port of Nouadhibou.
https://www.eib.org/en/projects/all/20240336

No current timetable, ticket, boarding, travel safety or train-length claim is made. Old Vercel URL retained, not replaced by a claim of a fresh Vercel deployment: https://iron-ore-train-web.vercel.app/
