# T08: Field report, README, and deploy (last)

## Goal
Close the loop like a forward deployed engineer: report what you learned and ship it.

## Do
- `src/sections/FieldReport.astro` from `content/field-report.md`, which Whitney writes herself from her notes. Three to five points, each shaped as: what happened, why it matters for a customer team, and what I'd change in Fredrin.
- Add `{ label: "Field report", href: "#field-report" }` to `nav.ts`.
- README.md: what this is, how it was built (waves, tickets, parallel runs), "What broke" (the T05/T06 conflict and the fix), how to run `agent-ready` on any repo, and links to the live page and whitneywerner.com.
- Deploy to Vercel. Put the live URL in the README.

## Done when
- The live site is up, CI is green on main, and the README tells the story in under two minutes of reading.
