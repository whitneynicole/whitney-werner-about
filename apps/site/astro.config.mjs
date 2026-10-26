// @ts-check
import { defineConfig } from "astro/config";

// Canonical URL for sitemap, robots and og:image. Set SITE_URL to override;
// on Vercel, the production domain is provided at build time.
const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
// Never ship localhost URLs from a Vercel build.
if (process.env.VERCEL && !process.env.SITE_URL && !vercelHost) {
  throw new Error("Vercel build has no SITE_URL or VERCEL_PROJECT_PRODUCTION_URL");
}
const site =
  process.env.SITE_URL ?? (vercelHost ? `https://${vercelHost}` : "http://localhost:4321");

// Static output for Vercel.
export default defineConfig({
  output: "static",
  site,
});
