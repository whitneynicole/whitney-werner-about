[![CI](https://github.com/whitneynicole/whitney-werner-about/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/whitneynicole/whitney-werner-about/actions/workflows/ci.yml)

# whitney-werner-about

A single-page site for Whitney Werner, built through Fredrin tickets (merge conflicts
resolved by hand) as an application for Fredrin's Forward Deployed Engineer role,
plus `agent-ready`, a small TypeScript CLI that scores how ready any repo is for coding agents.

- **Live page:** _add the Vercel production URL here after the first deploy (see [Deploy](#deploy))_
- **Whitney's site:** [whitneywerner.com](https://whitneywerner.com/?utm_source=fredrin&utm_medium=job_application&utm_campaign=job_search)

## How it was built

The repo was made agent-ready first: [`CONTEXT.md`](CONTEXT.md) (stack, commands,
conventions, hard rules) and [`AGENTS.md`](AGENTS.md) went in before any code. Then
eight tickets ([`tickets/`](tickets)) ran through Fredrin, one Worker, branch and PR
each, in waves:

- **Wave 1:** T01 scaffold first. Then T02 (`agent-ready` CLI) and T03 (content
  sections) ran in parallel. T04 (CI) waited on T02, because CI runs `agent-ready --min 80`.
- **Wave 2:** T05 (build replay) and T06 (playbook) ran in parallel on purpose: both
  edit `nav.ts` and `index.astro`, so a real conflict would happen. T07 (polish)
  overlapped with both.
- **Last:** T08, this README, the field report, and the deploy.

The page's Build replay section reads this repo's own git history, so the timeline
on the site is the real one.

## What broke

From [`notes.md`](notes.md) and the commit history:

1. **An interrupted run looked finished.** T05's Worker was likely cut off by the
   Claude session limit. It left a single "(WIP)" commit (data script only, no UI),
   and the ticket still moved to Review looking done. A code review caught it by
   checking the diff against the ticket, not the board.
2. **Lockfile conflicts on rebase.** T05 and T07 both hit `package.json` and
   `pnpm-lock.yaml` conflicts when rebased onto main.
3. **The planned conflict.** T05 merged first; T06 then rebased onto it and
   conflicted on `nav.ts` and `index.astro`. Whitney resolved it by hand, keeping both
   sides: the nav is Shipped, Build replay, Playbook, and the page renders Build
   replay then Playbook.
4. **A YAML colon broke main.** The build replay intro had an unquoted colon in its
   frontmatter, so the YAML stopped parsing. Quoting the intro fixed it.

## Run `agent-ready` on any repo

Needs Node 20+ and pnpm.

```sh
git clone https://github.com/whitneynicole/whitney-werner-about.git
cd whitney-werner-about
pnpm install
pnpm agent-ready /path/to/any/repo              # human-readable report
pnpm agent-ready /path/to/any/repo --json       # machine-readable
pnpm agent-ready /path/to/any/repo --min 80     # exit 1 below 80, for CI
```

It checks project context, documented commands, a test command, typecheck or lint,
CI, an env example, file sizes, git hygiene, a lockfile, and key-shaped secrets, and
says what to fix for each failure.

## Develop

```sh
pnpm install
pnpm typecheck
pnpm test
pnpm build
pnpm --filter site dev
```

## Deploy

The site is static Astro output on Vercel. [`vercel.json`](vercel.json) already sets
the install command, build command (`pnpm build`) and output directory
(`apps/site/dist`), so nothing needs overriding in the dashboard.

1. In Vercel, choose **Add New → Project** and import
   `whitneynicole/whitney-werner-about`.
2. Leave **Root Directory** as the repo root (`./`). The framework preset shows
   **Astro**; leave Build, Output and Install settings on their defaults so
   `vercel.json` applies.
3. Under **Environment Variables**, nothing is required: the build uses Vercel's
   `VERCEL_PROJECT_PRODUCTION_URL` for canonical, sitemap and social card links. To use
   a custom domain instead, add `SITE_URL` = `https://<your-domain>` for Production.
   Keep **Settings → Environment Variables → Automatically expose System Environment
   Variables** on; with neither variable, the build fails on purpose so it never ships
   localhost links.
4. Click **Deploy**. If install fails on the pnpm version, add
   `ENABLE_EXPERIMENTAL_COREPACK` = `1` so Vercel uses the `packageManager` pinned in
   `package.json`, then redeploy.
5. Open the production URL, check the page, and paste the URL into **Live page** at
   the top of this README.

Vercel clones shallowly and has no GitHub CLI login, so the build replay keeps the
committed `apps/site/src/data/build-log.json` instead of rebuilding it there.
