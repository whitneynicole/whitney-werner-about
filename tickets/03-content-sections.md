# T03: Hero, "Shipped," and "How I work with agents" sections (Wave 1)

## Goal
Render the page's main story from `apps/site/src/content/*.md`. Components must not hardcode copy.

## Do
- `src/sections/Hero.astro`: from `hero.md`. Name as the h1, one-line positioning, short intro, a link to whitneywerner.com with the UTM parameters.
- `src/sections/Shipped.astro`: from `shipped.md`. One card per project: title, one-sentence problem, what I built, the result number shown large, case study link. Cards are a CSS grid that collapses to one column on mobile.
- `src/sections/HowIWork.astro`: from `how-i-work.md`. A short numbered list.
- Subtle reveal on scroll using IntersectionObserver, disabled under `prefers-reduced-motion`.

## Files
`apps/site/src/sections/Hero.astro`, `Shipped.astro`, `HowIWork.astro`, and `apps/site/src/pages/index.astro` (only to place these three sections).

## Done when
- All copy comes from the markdown files.
- Every case study link has the UTM parameters.
- Axe reports zero violations for these sections.
