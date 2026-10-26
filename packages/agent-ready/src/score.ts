import { basename } from "node:path";
import { CHECKS } from "./checks/index.js";
import { loadRepo } from "./repo.js";
import type { CheckResult, Repo, Report, Status } from "./types.js";
import { VERSION } from "./version.js";

const POINTS: Record<Status, number> = { pass: 1, warn: 0.5, fail: 0 };

export function runChecks(repo: Repo): CheckResult[] {
  return CHECKS.map((check) => ({ id: check.id, title: check.title, ...check.run(repo) }));
}

export function score(results: CheckResult[]): number {
  if (results.length === 0) return 0;
  const earned = results.reduce((sum, r) => sum + POINTS[r.status], 0);
  return Math.round((earned / results.length) * 100);
}

/** Failures first, then warnings, each in check order. */
export function fixFirst(results: CheckResult[]): Report["fixFirst"] {
  return [...results.filter((r) => r.status === "fail"), ...results.filter((r) => r.status === "warn")].map(
    ({ id, title, status, fix }) => ({ id, title, status, fix }),
  );
}

export function scan(root: string, min = 0): Report {
  const repo = loadRepo(root);
  const checks = runChecks(repo);
  const total = score(checks);
  return {
    tool: "agent-ready",
    version: VERSION,
    repo: repo.packageJson()?.name ?? basename(root),
    score: total,
    maxScore: 100,
    min,
    passed: total >= min,
    checks,
    fixFirst: fixFirst(checks),
  };
}
