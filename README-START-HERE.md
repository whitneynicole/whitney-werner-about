# Fredrin application: "The page that shows how it was built"

## The idea (why this stands out)

Most applicants will hand in a nice About Me page. Fredrin's job post says the
application is "the job in miniature," so this project does the actual job on
your own repo and then shows the proof on the page:

1. **Make the repo agent-ready.** You write the Project Context and conventions
   *first*, the way you would on day one at a customer.
2. **Ship a real tool: `agent-ready`.** A small TypeScript CLI that scans any repo
   and scores how ready it is for coding agents (project context, test command,
   CI, lint, typecheck, file sizes, env example, and so on). It's the thing a
   forward deployed engineer would want in their pocket at every customer, and
   it shows TypeScript plus being comfortable with the file system and command line.
3. **Run tickets in parallel on purpose,** including two that touch the same
   file, so a real conflict happens. Resolve it with a rebase and write up
   what broke and why.
4. **CI flows back to the board.** GitHub Actions runs type checks, the
   `agent-ready` score, accessibility, and Lighthouse on every PR.
5. **The page renders its own build history.** A "Build replay" section reads
   the real git history at build time: which ticket, which branch, how long,
   merged when. Reviewers can see the Fredrin workflow, not just read about it.
6. **A field report.** An honest, short "what I'd change in Fredrin" section from
   your own experience building this. The job says "turn what you learn on site into
   product changes," and this is that, in miniature. Founders read this part.

## What's in this kit

- `CONTEXT.md`: paste into Fredrin's Project Context before any tickets.
- `CLAUDE.md` / `AGENTS.md`: rules Claude Code (and other agents) read automatically in each ticket.
- `COACH_PROMPT.md`: paste into a separate Claude Code session that guides and reviews (it never writes the code).
- `tickets/`: ticket specs, in two waves. Paste each one as a Fredrin ticket.
- `content/`: the page text, drafted from your real work. Edit freely.
- `.github/workflows/ci.yml`: starter CI. Ticket 04 finishes it.

## Order of operations (one evening plus a bit)

1. Create an empty GitHub repo, e.g. `whitney-werner-about`. Push these files.
2. Install Fredrin, connect GitHub, open the repo, paste `CONTEXT.md`.
3. **Wave 1, run in parallel:** tickets 01, 02, 03, 04.
   Review each PR yourself before merging. Never let a ticket approve itself.
4. **Wave 2, run in parallel:** tickets 05, 06, 07. Tickets 05 and 06 both add
   a nav link to `src/data/nav.ts`, so expect the conflict. Resolve it by
   rebasing the second branch and note the steps in your notes file.
5. Ticket 08 last: field report, README, deploy to Vercel.
6. In Fredrin, go to Send feedback, then Apply for a job. Say "Forward deployed
   engineer, project finished" and include the live link plus the repo link.

## Keep these true

- Only write things you actually did. The `content/` drafts use your real
  numbers. Change anything that doesn't sound like you.
- The field report must come from what you really hit while using Fredrin.
  Keep notes as you go (`notes.md`, not deployed).
- No phone or email on the page. Contact goes through whitneywerner.com.
