# T01: Scaffold the monorepo and design system (Wave 1)

## Goal
Set up the pnpm workspace, the Astro site shell, and the design tokens every other ticket builds on.

## Do
- Create a pnpm workspace with `apps/site` (Astro 5, TypeScript strict) and an empty `packages/agent-ready` folder containing only a placeholder `package.json`.
- Root scripts: `typecheck`, `test`, `build`, `agent-ready` (the last one can echo "not built yet" for now).
- Root `package.json` must set `"packageManager": "pnpm@12.15.0"` (CI reads this) and `"engines": { "node": ">=20" }`.
- Move the repo-root `content/` folder into `apps/site/src/content/` unchanged.
- `apps/site/src/styles/tokens.css`: colors, type scale, spacing, radius, from PROJECT_CONTEXT.
- `apps/site/src/layouts/Base.astro`: html lang, meta description, Open Graph tags, skip link, header with nav from `src/data/nav.ts`, main landmark, footer.
- `apps/site/src/data/nav.ts`: export an array with one item, `{ label: "Shipped", href: "#shipped" }`.
- Self-host Lora and Inter (woff2, `font-display: swap`).

## Files
Root config files, `apps/site/**` except `src/sections/**`, `packages/agent-ready/package.json`.

## Done when
- `pnpm install && pnpm typecheck && pnpm build` pass.
- The page renders at 360px and 1280px with no horizontal scroll.
- Lighthouse accessibility 100 on the empty shell.
