import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import type { PackageJson, Repo } from "./types.js";
import { MAX_FILES, SKIP_DIRS, walk } from "./walk.js";

/** Files larger than this are treated as unreadable (generated or binary). */
const MAX_READ_BYTES = 1_000_000;

export function loadRepo(root: string): Repo {
  // Inside git, list what git would commit: ignored files are local noise, and
  // skipping them before the file cap keeps a big ignored folder from hiding src/.
  const listed = git(root, ["ls-files", "-z", "--cached", "--others", "--exclude-standard"]);
  const files = listed ? gitFiles(root, listed) : walk(root);
  const fileSet = new Set(files);
  const cache = new Map<string, string | null>();
  let pkg: PackageJson | null | undefined;

  const read = (path: string): string | null => {
    if (cache.has(path)) return cache.get(path) ?? null;
    const text = fileSet.has(path) ? readText(join(root, path)) : null;
    cache.set(path, text);
    return text;
  };

  return {
    root,
    files,
    has: (path) => fileSet.has(path),
    read,
    packageJson() {
      if (pkg === undefined) pkg = parsePackageJson(read("package.json"));
      return pkg;
    },
  };
}

function gitFiles(root: string, listed: Set<string>): string[] {
  const files: string[] = [];
  for (const path of listed) {
    if (files.length >= MAX_FILES) break;
    if (path.split("/").some((part) => SKIP_DIRS.has(part))) continue;
    if (isFile(join(root, path))) files.push(path);
  }
  return files.sort();
}

/** False for deleted-but-tracked paths and submodule directories. */
function isFile(abs: string): boolean {
  try {
    return statSync(abs).isFile();
  } catch {
    return false;
  }
}

function readText(abs: string): string | null {
  try {
    if (statSync(abs).size > MAX_READ_BYTES) return null;
    const buf = readFileSync(abs);
    // A NUL byte in the first 8 KB is the usual sign of a binary file.
    if (buf.subarray(0, 8192).includes(0)) return null;
    return buf.toString("utf8");
  } catch {
    return null;
  }
}

function parsePackageJson(text: string | null): PackageJson | null {
  if (text === null) return null;
  try {
    const value: unknown = JSON.parse(text);
    return typeof value === "object" && value !== null ? (value as PackageJson) : null;
  } catch {
    return null;
  }
}

/** Paths from a `git ls-files -z` call, relative to root; null outside a work tree. */
function git(root: string, args: string[]): Set<string> | null {
  try {
    const out = execFileSync("git", args, {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
      stdio: ["ignore", "pipe", "ignore"],
    });
    return new Set(out.split("\0").filter(Boolean));
  } catch {
    return null;
  }
}
