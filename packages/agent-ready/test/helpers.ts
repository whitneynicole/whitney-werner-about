import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach } from "vitest";
import { scan } from "../src/score.js";
import type { CheckResult } from "../src/types.js";

export const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), "fixtures");

/** Built at runtime so this repo never commits a key-shaped string. */
export const FAKE_AWS_KEY = ["AKIA", "FAKEFAKEFAKE", "TEST"].join("");

const temps: string[] = [];
afterEach(() => {
  for (const dir of temps.splice(0)) rmSync(dir, { recursive: true, force: true });
});

/** Writes files into a fresh temp directory (outside any git repo). */
export function makeRepo(files: Record<string, string>, from?: string): string {
  const root = mkdtempSync(join(tmpdir(), "agent-ready-"));
  temps.push(root);
  if (from) cpSync(join(FIXTURES, from), root, { recursive: true });
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  }
  return root;
}

/** The secret fixture plus a config file holding the fake key. */
export function secretRepo(): string {
  return makeRepo({ "src/config.js": `export const region = "us-east-1";\nexport const key = "${FAKE_AWS_KEY}";\n` }, "secret");
}

export function check(root: string, id: string): CheckResult {
  const result = scan(root).checks.find((c) => c.id === id);
  if (!result) throw new Error(`no check ${id}`);
  return result;
}
