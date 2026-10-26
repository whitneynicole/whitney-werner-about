import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Every page section reads its copy from one markdown file in src/content/.
// Entry ids are the file names: "hero", "shipped", "how-i-work", ...
// Sections validate their own frontmatter; this schema only accepts it.
const pages = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content" }),
  schema: z.object({}).passthrough(),
});

export const collections = { pages };
