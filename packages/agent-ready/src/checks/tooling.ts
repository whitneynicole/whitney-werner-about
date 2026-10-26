import type { Check, Repo } from "../types.js";
import { fail, pass, preview, warn } from "./helpers.js";

/** The placeholder `npm init` writes; it is not a real test command. */
const NPM_DEFAULT_TEST = /no test specified/;

function scripts(repo: Repo): Record<string, string> {
  return repo.packageJson()?.scripts ?? {};
}

function detectPytest(repo: Repo): string | null {
  if (repo.has("pytest.ini") || repo.has("conftest.py")) return "pytest";
  if (/\[tool\.pytest/.test(repo.read("pyproject.toml") ?? "")) return "pytest (pyproject.toml)";
  if (/\[tool:pytest\]/.test(repo.read("setup.cfg") ?? "")) return "pytest (setup.cfg)";
  if (/\[pytest\]/.test(repo.read("tox.ini") ?? "")) return "pytest (tox.ini)";
  return null;
}

export const testCommand: Check = {
  id: "test-command",
  title: "Test command",
  run(repo) {
    const test = scripts(repo).test;
    if (test && !NPM_DEFAULT_TEST.test(test)) return pass(`package.json "test": ${test}`);
    const pytest = detectPytest(repo);
    if (pytest) return pass(`${pytest} detected`);
    if (repo.has("go.mod") && repo.files.some((f) => f.endsWith("_test.go"))) return pass("go test detected");
    return fail("No test command found", 'Add a "test" script to package.json so agents can check their work.');
  },
};

const CHECK_SCRIPT = /^(?:typecheck|type-check|types|tsc|lint)(?::|$)/;

export const typecheckOrLint: Check = {
  id: "typecheck-or-lint",
  title: "Typecheck or lint",
  run(repo) {
    const found = Object.keys(scripts(repo)).filter((name) => CHECK_SCRIPT.test(name));
    if (found.length > 0) return pass(`package.json script${found.length > 1 ? "s" : ""}: ${preview(found)}`);
    return fail(
      "No typecheck or lint script",
      'Add a "typecheck" or "lint" script so agents catch mistakes before tests.',
    );
  },
};

export const ci: Check = {
  id: "ci",
  title: "CI",
  run(repo) {
    const workflows = repo.files.filter((f) => /^\.github\/workflows\/[^/]+\.ya?ml$/.test(f));
    if (workflows.length === 0) {
      return fail("No .github/workflows/*.yml", "Add a GitHub Actions workflow that runs tests on pull_request.");
    }
    const onPr = workflows.filter((f) => /\bpull_request(?:_target)?\b/.test(repo.read(f) ?? ""));
    if (onPr.length > 0) return pass(`${preview(onPr)} runs on pull_request`);
    return warn(`${workflows.length} workflow(s), none run on pull_request`, "Add `pull_request` to a workflow's `on:` triggers.");
  },
};

const JS_LOCKFILES = ["pnpm-lock.yaml", "package-lock.json", "yarn.lock", "bun.lock", "bun.lockb", "npm-shrinkwrap.json"];
const OTHER_LOCKFILES = ["poetry.lock", "uv.lock", "Pipfile.lock", "Cargo.lock", "go.sum", "Gemfile.lock", "composer.lock"];

export const lockfile: Check = {
  id: "lockfile",
  title: "Lockfile",
  run(repo) {
    const js = JS_LOCKFILES.filter((f) => repo.has(f));
    if (js.length > 1) {
      return fail(`${js.length} lockfiles: ${js.join(", ")}`, "Keep one package manager's lockfile and delete the others.");
    }
    if (js.length === 1) return pass(js[0] as string);
    if (repo.has("package.json")) {
      return fail("package.json but no lockfile", "Commit a lockfile so agents install the same versions you do.");
    }
    const other = OTHER_LOCKFILES.filter((f) => repo.has(f));
    if (other.length > 0) return pass(preview(other));
    return warn("No lockfile found", "Commit your package manager's lockfile for reproducible installs.");
  },
};
