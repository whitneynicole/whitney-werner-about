# Instructions for coding agents in this repo

Read `PROJECT_CONTEXT.md` first and follow it exactly. It is the source of truth
for stack, commands, conventions, design, and hard rules.

You are running as a Fredrin worker on one ticket. Rules:
- Work only on the files your ticket names. If you need to touch another file, say why in the PR.
- Start every commit message with the ticket number: `T0X: summary`.
- Before you say you're done, run `pnpm typecheck`, `pnpm test`, and `pnpm build`, and report the results.
- Never invent facts about Whitney. Page copy comes only from `apps/site/src/content/`.
- Never add a phone number or email address.
- If the ticket is unclear, write your question in the PR description instead of guessing.
