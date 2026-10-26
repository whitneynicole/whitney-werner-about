---
steps:
  - when: Day 1
    do: Install Fredrin with the team lead, connect GitHub, and pick three real, small tickets from their backlog. Sit with one engineer while the first agent run happens.
    signal: One agent-run PR opened against their real code on day one.
  - when: Week 1
    do: Run agent-ready on their repo, then write the Project Context and conventions together with the team (commands, file layout, review rules). Prove it against the same three tickets.
    signal: First agent-run tickets merged without rework, and the agent-ready score rises.
  - when: Weeks 2 and 3
    do: Wire CI status back to the board, set up the agents and machines they want, and run tickets in parallel. Watch where it breaks (conflicts, flaky tests, missing context) and fix the cause, not the symptom.
    signal: Several tickets running in parallel each day, and the team adds tickets without asking me.
  - when: Day 30
    do: Hand off a short written playbook, and turn anything I scripted for this account into a product change or a docs page instead of a one-off.
    signal: The team keeps shipping through Fredrin when I'm not in the room. Every account-specific script either became a product change or was deleted.
---
