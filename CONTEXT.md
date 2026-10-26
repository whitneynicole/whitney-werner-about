# Project Context: whitney-werner-about

## What this repo is
A single-page personal site for Whitney Werner, built entirely through Fredrin
tickets as an application for Fredrin's Forward Deployed Engineer role, plus a
small TypeScript CLI called `agent-ready` that lives in `packages/agent-ready`.

## Stack
- Astro 5 + TypeScript (strict). No UI framework. Plain CSS with custom properties.
- Node 20+, pnpm workspaces (`apps/site`, `packages/agent-ready`).
- Tests: Vitest for the CLI, Playwright for one smoke test of the site.
- Deploy: Vercel (static output).

## Commands (agents: always run these before saying a ticket is done)
- `pnpm install`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm agent-ready .` (must not lower the current score)

## Conventions
- One ticket = one branch = one PR. Keep each ticket inside the files it names.
- Small files: keep source files under 250 lines; split instead.
- Page content lives in `apps/site/src/content/*.md`. Components never hardcode copy.
- Section components live in `apps/site/src/sections/`, one file per section.
- Navigation is defined only in `apps/site/src/data/nav.ts`.
- Commit messages: `T0X: short imperative summary` (ticket number first). The build
  replay depends on this format.
- No new dependencies without saying why in the PR description.

## Design
- Background warm beige `#f6f1e8`, ink `#14171c`, accent navy `#1f3a5c`, muted `#666c76`.
- Headings: Lora. Body: Inter. Never use orange.
- Respect `prefers-reduced-motion`. Motion is subtle and purposeful.
- Mobile first: works at 360px with no horizontal scroll.

## Quality bar
- WCAG 2.2 AA: semantic landmarks, one h1, visible focus, alt text, 4.5:1 contrast.
- Lighthouse 95+ on all four categories. No layout shift. Images WebP with width/height.

## Hard rules
- Never add a phone number or email address anywhere in the repo.
- All links to whitneywerner.com use
  `?utm_source=fredrin&utm_medium=job_application&utm_campaign=job_search`.
- Do not invent facts about Whitney. Use only what is in `src/content/`.
- If a ticket is ambiguous, write the question in the PR description instead of guessing.
