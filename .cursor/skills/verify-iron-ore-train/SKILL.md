# Verify IronOreTrain
Iron Ore Train - Mauritania railway journey (pnpm monorepo, Next static export).
## Launch
`pnpm install`, `pnpm -r build` (produces apps/web/out), serve that directory.
## Doctor
`python3 .cursor/skills/verify-iron-ore-train/verify.py` - a few minutes (real Chromium).
## Drive
Runs the vitest suites (49 tests), builds the static export, then the repo's own verification/check.cjs (28 states at 390 and 1440: drag/reset, keyboard, floors, audio opt-in/off/replay).
## Evidence
`.cursor/skills/verify-iron-ore-train/evidence.json`
## Cleanup
The check kills its static server.
## Known boundaries
pnpm workspace; check.cjs needs apps/web/out built first (the runner does it).
