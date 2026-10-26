export type Status = "pass" | "warn" | "fail";

export interface CheckResult {
  id: string;
  title: string;
  status: Status;
  /** What the check found, in one line. */
  detail: string;
  /** One-line fix. Empty when the check passes. */
  fix: string;
}

export type Finding = Omit<CheckResult, "id" | "title">;

export interface Check {
  id: string;
  title: string;
  run(repo: Repo): Finding;
}

export interface Report {
  tool: "agent-ready";
  version: string;
  /** package.json name, else the folder name (never an absolute path). */
  repo: string;
  score: number;
  maxScore: 100;
  min: number;
  passed: boolean;
  checks: CheckResult[];
  fixFirst: Array<Pick<CheckResult, "id" | "title" | "status" | "fix">>;
}

export interface Repo {
  root: string;
  /** Files under root (POSIX relative paths), minus the skip list and, in git, ignored files. */
  files: string[];
  has(path: string): boolean;
  /** UTF-8 contents, or null for missing, binary or very large files. Cached. */
  read(path: string): string | null;
  packageJson(): PackageJson | null;
}

export interface PackageJson {
  name?: string;
  scripts?: Record<string, string>;
}
