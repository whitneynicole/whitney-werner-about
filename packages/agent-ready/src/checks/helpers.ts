import type { Finding, Repo } from "../types.js";

export const pass = (detail: string): Finding => ({ status: "pass", detail, fix: "" });
export const warn = (detail: string, fix: string): Finding => ({ status: "warn", detail, fix });
export const fail = (detail: string, fix: string): Finding => ({ status: "fail", detail, fix });

/** Root-level files agents read as project context, in priority order. */
export const CONTEXT_FILES = [
  "CONTEXT.md",
  "CLAUDE.md",
  "AGENTS.md",
  "GEMINI.md",
  ".cursorrules",
  ".windsurfrules",
  ".clinerules",
  ".github/copilot-instructions.md",
];

/** Context files that exist, including any `.cursor/rules/*` files. */
export function contextFiles(repo: Repo): string[] {
  const found = CONTEXT_FILES.filter((f) => repo.has(f));
  const cursorRules = repo.files.filter((f) => /^\.cursor\/rules\/[^/]+$/.test(f));
  return [...found, ...cursorRules];
}

/** Root README, whatever its casing or extension. */
export function readmeFile(repo: Repo): string | undefined {
  return repo.files.find((f) => /^readme(\.[a-z]+)?$/i.test(f));
}

export const SOURCE_EXTENSIONS = new Set([
  "ts", "tsx", "mts", "cts", "js", "jsx", "mjs", "cjs",
  "astro", "vue", "svelte", "py", "go", "rs", "rb", "java", "kt",
  "swift", "php", "cs", "c", "h", "cpp", "hpp", "scala",
]);

export function extension(path: string): string {
  const name = path.slice(path.lastIndexOf("/") + 1);
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : "";
}

export function isSource(path: string): boolean {
  return SOURCE_EXTENSIONS.has(extension(path)) && !/\.d\.[cm]?ts$/.test(path);
}

export function lineCount(text: string): number {
  if (text.length === 0) return 0;
  let lines = 1;
  for (let i = 0; i < text.length; i++) if (text.charCodeAt(i) === 10) lines++;
  return text.endsWith("\n") ? lines - 1 : lines;
}

/** "a", "a and b", "a, b and c". */
export function list(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** Shows at most `max` items, then "+N more". */
export function preview(items: string[], max = 3): string {
  const shown = items.slice(0, max).join(", ");
  return items.length > max ? `${shown} +${items.length - max} more` : shown;
}
