# Build notes (not deployed)

Write down anything surprising while you build: where you got stuck, what the
agents guessed wrong, conflicts and how you fixed them, and what you wish the
board did. This becomes the field report and the README's "What broke."

## Setup
- Onboarding only offered Cloud runs; linking a local folder was in project settings afterward.
- Project Context is found through the "Memory folder" setting (CONTEXT.md), not a visible "Project Context" field. I expected a paste box.
- Unclear whether a Claude subscription token is required for local workers, or what the free tier covers. Customers will hesitate to paste a long-lived token.
- Local workers ran on the free tier with no Claude token needed (This machine, Opus 5.5, High).

## Filing tickets
- The fredrin CLI is installed at ~/.fredrin/bin/fredrin but isn't on the shell PATH, so the planner had to search for it and fell back to calling the API directly.
- A shell-quoting bug filed two tickets out of order with broken links. The planner caught it and archived them, but a customer might not notice.
- Auto-merge is on by default for every ticket, which works against a "review every PR" team. I turned it off on all 8.
- The planner made good dependency calls on its own: T04 waits on T02 (CI needs the CLI), and T06 runs alongside T05 so the planned conflict still happens.

## Wave 1: T01
- The API refuses to start local tickets, so the planner triggers a "Start a Worker on <id>?" pop-up. Good safety check, but it shows the internal ID, not the ticket name (T01), so it's hard to tell which ticket you're approving.
- macOS showed "Data Access Blocked: Fredrin tried to access data from other apps" during T01, with no explanation in Fredrin of what or why. I left it blocked.
- Workers run Claude Code with "bypass permissions on". Fine in a sandboxed repo, but customer security teams will ask about it.
- The worker asked 3 clear questions in the PR instead of guessing. It couldn't test keyboard focus in its headless browser, so I checked the skip link by hand (Tab, then Enter jumped to #main).
- The PR score badge dropped from 80 to 70 after a one-line content change, with no explanation of what it measures or why it moved.
- Tried gh pr checkout 1 and git refused: the branch was already checked out in Fredrin's worktree (~/.fredrin/worktrees/...PNRUL9). Ran checks inside the worktree instead. An "Open worktree in Terminal" button on the card would save customers this.
- I twice typed my own verification commands into the worker's prompt instead of my Terminal, so the agent ended up checking its own work. The worker prompt and a terminal look almost the same; a clearer label would help.

## Wave 1: T02 + T03 in parallel
- While T02 and T03 ran in parallel, the Fredrin window went completely blank. It came back, with both tickets finished in Review.
- T02's worker picked Vitest 3 over 5 because Vitest 5 needs Node 22 and CI runs Node 20, and wrote the reason in the PR.
- T02 asked whether to commit agent-ready.json. I said no (T05 generates it at build time), and the worker recorded that as a "Decision" in the PR.
- Review follow-ups: nav has no link to #how-i-work yet; hero says "scroll to the build replay" before T05 exists. Raise in T05/T06.
- Merge order ended up T02 then T03 (not the planned T03 first), so T03 needed a rebase onto main.
- Rebased T03 onto main by hand in Fredrin's worktree: backup branch first, git fetch, git rebase origin/main. Clean, since the tickets touched separate folders.
- Rebase lesson: use git push --force-with-lease=<branch>:<old SHA>, not plain --force-with-lease, because background git fetches (Fredrin, editors) update origin/<branch> and can quietly cancel the protection.

## Wave 2
- T05's Worker was likely cut off by the Claude session limit; it left a single "(WIP)" commit (data script only, no UI) and the ticket still moved to Review looking finished. The board made it look done; my coach's code review caught it by checking the diff against the ticket. Fredrin should mark interrupted runs clearly (e.g. "Stopped: usage limit") instead of sending them to Review.
