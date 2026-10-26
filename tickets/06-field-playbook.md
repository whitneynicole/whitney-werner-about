# T06: "My first 30 days at a Fredrin customer" section (Wave 2)

## Goal
Show how I'd land Fredrin inside a real engineering team, using `apps/site/src/content/playbook.md`.

## Do
- `src/sections/Playbook.astro`: four steps (Day 1, Week 1, Weeks 2 and 3, Day 30) as a stepped layout, each with "what I do" and "how I know it worked."
- Add `{ label: "Playbook", href: "#playbook" }` to `src/data/nav.ts`.

## Files
`apps/site/src/sections/Playbook.astro`, `apps/site/src/data/nav.ts`, `apps/site/src/pages/index.astro` (placement only).

## Note
T05 also edits `nav.ts` and `index.astro`. This conflict is on purpose. Merge T05 first, then rebase this branch onto main, resolve, and record the steps in `notes.md`.
