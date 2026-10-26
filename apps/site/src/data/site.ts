import { getEntry } from "astro:content";

export interface SiteMeta {
  name: string;
  title: string;
  /** Meta and Open Graph description. */
  description: string;
  /** whitneywerner.com link, already carrying the required UTM params. */
  site: string;
  /** Hostname of `site`, for link text. */
  siteHost: string;
}

function requireString(data: Record<string, unknown>, key: string): string {
  const value = data[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`src/content/hero.md: frontmatter "${key}" must be a non-empty string`);
  }
  return value;
}

// Site-wide identity comes from hero.md frontmatter, never from components.
export async function getSiteMeta(): Promise<SiteMeta> {
  const hero = await getEntry("pages", "hero");
  if (!hero) throw new Error("src/content/hero.md is missing");
  const data = hero.data as Record<string, unknown>;
  const site = requireString(data, "site");
  return {
    name: requireString(data, "name"),
    title: requireString(data, "title"),
    description: requireString(data, "description"),
    site,
    siteHost: new URL(site).hostname,
  };
}
