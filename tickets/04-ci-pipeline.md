# T04: CI that reports back to the board (Wave 1)

## Goal
Every PR gets checks Fredrin's board can show: typecheck, tests, build, the agent-ready score, accessibility, and Lighthouse.

## Do
- Finish `.github/workflows/ci.yml` (starter included): on `pull_request` and `push` to main.
- Jobs: `typecheck`, `test`, `build`, then `quality` (needs build):
  - Run `pnpm agent-ready . --min 80`.
  - Serve the built site and run Playwright smoke + `@axe-core/playwright` on `/`.
  - Run Lighthouse CI with budgets: performance, accessibility, best practices, and SEO all at 95 or above.
- Cache pnpm. Keep total CI under 4 minutes.
- Add a status badge to README.md.

## Files
`.github/workflows/ci.yml`, `apps/site/tests/smoke.spec.ts`, `lighthouserc.json`, README badge line only.

## Done when
- CI is green on the PR, and the check names show on the Fredrin board.
