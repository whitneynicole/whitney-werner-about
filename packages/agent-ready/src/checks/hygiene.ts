import type { Check } from "../types.js";
import { extension, fail, isSource, lineCount, pass, preview, warn } from "./helpers.js";

// A real read (`.X`, `[X]`, or a destructure ending in `;`), not prose that names it.
const ENV_READ = /\bprocess\.env\s*(?:[.[;,)}]|$)/m;
const JS_EXTENSIONS = new Set(["ts", "tsx", "mts", "cts", "js", "jsx", "mjs", "cjs", "astro", "vue", "svelte"]);
const ENV_EXAMPLES = [".env.example", ".env.sample", ".env.template"];

/** True when dir (or any parent up to the repo root) has an env example. */
function hasEnvExample(has: (path: string) => boolean, file: string): boolean {
  const parts = file.split("/").slice(0, -1);
  for (let depth = parts.length; depth >= 0; depth--) {
    const dir = parts.slice(0, depth).join("/");
    if (ENV_EXAMPLES.some((name) => has(dir ? `${dir}/${name}` : name))) return true;
  }
  return false;
}

export const envExample: Check = {
  id: "env-example",
  title: "Env example",
  run(repo) {
    const readers = repo.files.filter((f) => JS_EXTENSIONS.has(extension(f)) && ENV_READ.test(repo.read(f) ?? ""));
    if (readers.length === 0) return pass("Code does not read process.env");
    const uncovered = readers.filter((f) => !hasEnvExample(repo.has, f));
    if (uncovered.length === 0) return pass(`.env.example covers ${readers.length} file(s) reading process.env`);
    return fail(
      `process.env read with no .env.example: ${preview(uncovered)}`,
      "Add .env.example listing every variable (names and dummy values only).",
    );
  },
};

const MAX_LINES = 400;

export const fileSize: Check = {
  id: "file-size",
  title: "File size",
  run(repo) {
    const sources = repo.files.filter(isSource);
    const large = sources
      .map((file) => ({ file, lines: lineCount(repo.read(file) ?? "") }))
      .filter((s) => s.lines > MAX_LINES)
      .sort((a, b) => b.lines - a.lines);
    if (large.length === 0) return pass(`No source file over ${MAX_LINES} lines (${sources.length} scanned)`);
    const top = large[0] as { file: string; lines: number };
    return warn(
      `${large.length} file(s) over ${MAX_LINES} lines: ${preview(large.map((s) => `${s.file} (${s.lines})`))}`,
      `Split ${top.file} into smaller modules; agents lose context in large files.`,
    );
  },
};

/** Normalizes a .gitignore pattern so `/node_modules/` and `**\/node_modules` compare equal. */
function normalize(line: string): string {
  return line.trim().replace(/^\/|^\*\*\//, "").replace(/\/$/, "");
}

export const gitHygiene: Check = {
  id: "git-hygiene",
  title: "Git hygiene",
  run(repo) {
    const text = repo.read(".gitignore");
    if (text === null) {
      return fail("No .gitignore", "Add a .gitignore that covers node_modules and .env.");
    }
    const patterns = new Set(text.split(/\r?\n/).filter((l) => l && !l.startsWith("#")).map(normalize));
    const missing: string[] = [];
    if (!["node_modules", "node_modules*"].some((p) => patterns.has(p))) missing.push("node_modules");
    if (![".env", ".env*", "*.env"].some((p) => patterns.has(p))) missing.push(".env");
    if (missing.length === 0) return pass(".gitignore covers node_modules and .env");
    return warn(`.gitignore does not cover ${missing.join(" or ")}`, `Add ${missing.join(" and ")} to .gitignore.`);
  },
};

/** Common credential shapes. Matches are reported by kind and location only. */
const SECRET_PATTERNS: Array<{ kind: string; pattern: RegExp }> = [
  { kind: "AWS access key", pattern: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/ },
  { kind: "GitHub token", pattern: /\b(?:gh[pousr]_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{60,})/ },
  { kind: "GitLab token", pattern: /\bglpat-[A-Za-z0-9_-]{20}\b/ },
  { kind: "OpenAI/Anthropic key", pattern: /\bsk-(?:proj-|ant-)?[A-Za-z0-9_-]{32,}/ },
  { kind: "Stripe live key", pattern: /\b[rs]k_live_[A-Za-z0-9]{20,}/ },
  { kind: "Slack token", pattern: /\bxox[abprs]-[A-Za-z0-9-]{10,}/ },
  { kind: "Google API key", pattern: /\bAIza[0-9A-Za-z_-]{35}/ },
  { kind: "Private key", pattern: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY(?: BLOCK)?-----/ },
];

export const secrets: Check = {
  id: "secrets",
  title: "Secrets",
  run(repo) {
    // Only committed files matter; outside git, every scanned file counts.
    const files = repo.tracked ? repo.files.filter((f) => repo.tracked?.has(f)) : repo.files;
    const hits: string[] = [];
    for (const file of files) {
      const text = repo.read(file);
      if (text === null) continue;
      for (const { kind, pattern } of SECRET_PATTERNS) {
        const match = pattern.exec(text);
        if (match) {
          const line = lineCount(text.slice(0, match.index + 1));
          hits.push(`${kind} in ${file}:${line}`);
          break;
        }
      }
    }
    if (hits.length === 0) return pass(`No key-shaped strings in ${files.length} file(s)`);
    return fail(
      `${hits.length} possible secret(s): ${preview(hits)}`,
      "Revoke the key, remove it from the file and git history, and load it from the environment.",
    );
  },
};
