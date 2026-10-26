# T07: Polish, social card, and performance (Wave 2)

## Do
- Generate a 1200x630 Open Graph image at build time (satori or a static SVG-to-PNG step), using the name, title, and agent-ready score.
- Favicon, `robots.txt`, `sitemap.xml`, JSON-LD `Person` (name, url, jobTitle; no email or phone).
- Check: no layout shift, fonts preloaded, total page weight under 200 KB excluding the OG image.
- Add a print stylesheet so the page prints cleanly on two pages.

## Files
`apps/site/public/**`, `apps/site/src/layouts/Base.astro` (head only), `apps/site/src/styles/print.css`.

## Done when
- Lighthouse 95+ in all four categories in CI.
