import { readdirSync } from "node:fs";
import { join } from "node:path";

/** Directories never worth scanning: dependencies, VCS data and build output. */
export const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  ".astro",
  "build",
  "coverage",
  ".next",
  ".turbo",
  ".vercel",
  ".svelte-kit",
  ".venv",
  "venv",
  "__pycache__",
]);

/** Hard cap so a huge monorepo stays fast; checks work on what was seen. */
export const MAX_FILES = 50_000;

/**
 * Iteratively lists files under root as POSIX relative paths.
 * Symlinks are not followed, so a link cycle cannot hang the walk.
 */
export function walk(root: string): string[] {
  const files: string[] = [];
  const stack = [""];
  while (stack.length > 0 && files.length < MAX_FILES) {
    const rel = stack.pop() as string;
    let entries;
    try {
      entries = readdirSync(join(root, rel), { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const path = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) stack.push(path);
      } else if (entry.isFile()) {
        files.push(path);
        if (files.length >= MAX_FILES) break;
      }
    }
  }
  return files.sort();
}
