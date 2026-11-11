#!/usr/bin/env python3
"""Verification runner for IronOreTrain. See SKILL.md."""
import json, os, re, subprocess, sys, time
from pathlib import Path
REPO = Path(__file__).resolve().parents[3]
failures = []
def check(name, ok, detail=''):
    print(('PASS' if ok else 'FAIL'), name, (':: ' + str(detail))[:400] if detail else '')
    if not ok: failures.append(name)
def run(cmd, **kw):
    return subprocess.run(cmd, cwd=REPO, capture_output=True, text=True, timeout=900, **kw)
def main():
    if not (REPO / 'node_modules').is_dir():
        check('pnpm install', run(['pnpm', 'install', '--no-frozen-lockfile']).returncode == 0)
    proc = run(['npx', 'vitest', 'run'])
    tail = re.sub(r'\x1b\[[0-9;]*m', '', proc.stdout + proc.stderr)
    m = re.search(r'Tests\s+(\d+) passed', tail)
    check('vitest suites (49 tests)', proc.returncode == 0 and m, tail[-300:])
    proc = run(['pnpm', '-r', 'build'])
    check('pnpm build (next static export to apps/web/out)', proc.returncode == 0, (proc.stdout + proc.stderr)[-300:])
    proc = run(['node', 'verification/check.cjs'])
    tail = proc.stdout + proc.stderr
    check('browser journey check (28 states: drag/reset, keyboard, floors, audio opt-in)', proc.returncode == 0 and 'PASS' in tail, tail[-300:])
    print('FAILURES=%d' % len(failures))
    with open(REPO / '.cursor/skills/verify-iron-ore-train/evidence.json', 'w') as f:
        json.dump({'repo': 'IronOreTrain', 'ts': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), 'failures': failures}, f, indent=2)
    return 1 if failures else 0
if __name__ == '__main__':
    sys.exit(main())
