import type { APIRoute } from "astro";

// One page, so one URL. The base comes from `site` in astro.config.mjs.
export const GET: APIRoute = ({ site }) => {
  if (!site) throw new Error("sitemap.xml needs `site` set in astro.config.mjs");
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${new URL("/", site).href}</loc></url>
</urlset>
`;
  return new Response(body, { headers: { "Content-Type": "application/xml" } });
};
