---
title: Field report
intro: I built this page through Fredrin in one afternoon, with 8 tickets, a planner, local Claude Code workers, parallel runs, and one rebase I did by hand. Here's what I'd bring back to the team from the field.
---

### 1. An interrupted run looked finished
**What happened:** T05's Worker stopped partway, around the time my Claude session limit hit. It left a single "(WIP)" commit, but the card moved to Review like any finished ticket. My reviewer caught it by comparing the diff to the ticket, not the board.
**Why it matters:** A customer engineer scanning the board would merge half a feature.
**What I'd change:** Mark stopped runs clearly ("Stopped: usage limit") and keep them out of Review until the Worker says it's done.

### 2. Review feedback can't ride along with a rerun
**What happened:** To send changes back on T04 and T05, the planner posted my review, reran the ticket, then retried `fredrin tickets send` every 10 seconds until the new session came up.
**Why it matters:** "Request changes" is the most common loop in code review.
**What I'd change:** A Request changes action that reruns the ticket with the review as its opening message.

### 3. Worktrees surprise people the first time
**What happened:** `gh pr checkout` failed because Fredrin's worktree already had the branch. I ran checks inside `~/.fredrin/worktrees` instead, and later rebased T03 there by hand.
**Why it matters:** Every engineer who reviews locally will hit this on day one.
**What I'd change:** An "Open worktree in Terminal" button on each card, plus a one-line explanation the first time.

### 4. Say what Fredrin uses, and why
**What happened:** The planner ran on my own Claude plan without a pasted token (I found out when it hit the limit), macOS blocked Fredrin twice with no explanation in the app, and Workers run with permission prompts bypassed.
**Why it matters:** These are the first questions a customer's security team asks.
**What I'd change:** A short "what Fredrin accesses" page in onboarding, and an in-app note whenever the OS blocks something.

### What I'd keep
The planner made real engineering calls on its own. It made CI wait on the CLI, kept T05 and T06 running in parallel so my planned conflict would still happen, checked ticket text byte for byte, and flagged out-of-scope edits instead of hiding them. The live preview in the Browser tab let me review the page without leaving the app.
