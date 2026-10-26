import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseArgs } from "../src/args.js";
import { main } from "../src/main.js";
import { FIXTURES } from "./helpers.js";

function run(...argv: string[]) {
  let stdout = "";
  let stderr = "";
  const code = main(argv, { write: (s: string) => (stdout += s) }, { write: (s: string) => (stderr += s) });
  return { code, stdout, stderr };
}

describe("parseArgs", () => {
  it("reads path, --json and both --min spellings", () => {
    expect(parseArgs(["repo", "--json", "--min", "80"])).toMatchObject({ path: "repo", json: true, min: 80 });
    expect(parseArgs(["--min=50"])).toMatchObject({ path: ".", min: 50 });
  });

  it("rejects unknown flags, extra paths and bad --min values", () => {
    expect(() => parseArgs(["--nope"])).toThrow("Unknown option");
    expect(() => parseArgs(["a", "b"])).toThrow("Unexpected argument");
    expect(() => parseArgs(["--min"])).toThrow("--min");
    expect(() => parseArgs(["--min", "-5"])).toThrow("--min");
  });
});

describe("main", () => {
  it("prints the score, a table and a fix list", () => {
    const { code, stdout } = run(join(FIXTURES, "bare"));
    expect(code).toBe(0);
    expect(stdout).toContain("Score: 35/100");
    expect(stdout).toContain("FAIL    Project context");
    expect(stdout).toContain("Fix these first:");
  });

  it("prints the same data as JSON", () => {
    const { stdout } = run(join(FIXTURES, "good"), "--json");
    const report = JSON.parse(stdout);
    expect(report).toMatchObject({ tool: "agent-ready", score: 100, maxScore: 100, passed: true });
    expect(report.checks).toHaveLength(10);
  });

  it("exits 1 under --min and 0 at or above it", () => {
    expect(run(join(FIXTURES, "bare"), "--min", "36").code).toBe(1);
    expect(run(join(FIXTURES, "bare"), "--min", "35").code).toBe(0);
  });

  it("exits 2 on bad usage or a missing directory", () => {
    expect(run("--bogus").code).toBe(2);
    const missing = run(join(FIXTURES, "does-not-exist"));
    expect(missing.code).toBe(2);
    expect(missing.stderr).toContain("not a directory");
  });
});
