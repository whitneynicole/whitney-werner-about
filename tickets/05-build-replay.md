# T05: "Build replay" section from real git history (Wave 2)

## Goal
Show how this page was built, using the repo's own history, so reviewers see the Fredrin workflow instead of reading claims about it.

## Do
- `apps/site/scripts/build-log.ts`, run before `astro build` (`prebuild` script):
  - Read `git log --merges --first-parent main` plus each merged branch's commits.
  - Group by ticket number from commit messages (`T0X: ...`).
  - For each ticket: title, branch name, first commit time, merge time, duration, number of commits, files touched, and whether it needed a rebase or conflict fix (detect from commit messages containing "rebase" or "resolve").
  - Write `apps/site/src/data/build-log.json`. If git isn't available in the build environment, keep the last committed JSON (Vercel shallow clones: set the fetch depth or commit the JSON in CI).
- `src/sections/BuildReplay.astro`:
  - A horizontal timeline (vertical on mobile) of tickets as lanes, showing which ran in parallel.
  - Each ticket expands to show branch, duration, commits, and files.
  - The conflict ticket is visibly marked, with a link to "What broke" in the README.
  - Show the `agent-ready` score from `src/data/agent-ready.json` as a badge: "This repo scores N/100 agent-ready."
- Add `{ label: "Build replay", href: "#build-replay" }` to `src/data/nav.ts`.

## Files
`apps/site/scripts/build-log.ts`, `apps/site/src/sections/BuildReplay.astro`, `apps/site/src/data/nav.ts`, `apps/site/package.json` (prebuild only), `apps/site/src/pages/index.astro` (placement only).

## Done when
- The section renders real data from this repo's history.
- It works with keyboard only, and the timeline has a text alternative (a list).
