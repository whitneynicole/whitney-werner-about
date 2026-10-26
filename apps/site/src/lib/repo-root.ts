import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

// Builds run from apps/site; walk up to the pnpm workspace root.
export function repoRoot(from = process.cwd()): string {
  let dir = from;
  while (!existsSync(join(dir, "pnpm-workspace.yaml"))) {
    const parent = dirname(dir);
    if (parent === dir) throw new Error(`No pnpm-workspace.yaml above ${from}`);
    dir = parent;
  }
  return dir;
}
