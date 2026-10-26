import type { APIRoute } from "astro";

// Generated rather than static so the Sitemap line carries the real site URL.
export const GET: APIRoute = ({ site }) => {
  if (!site) throw new Error("robots.txt needs `site` set in astro.config.mjs");
  const body = `User-agent: *
Allow: /

Sitemap: ${new URL("/sitemap.xml", site).href}
`;
  return new Response(body, { headers: { "Content-Type": "text/plain" } });
};
