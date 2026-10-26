import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { formatReport } from "../src/format.js";
import { scan } from "../src/score.js";
import { FAKE_AWS_KEY, FIXTURES, makeRepo, secretRepo } from "./helpers.js";

const statuses = (root: string) => Object.fromEntries(scan(root).checks.map((c) => [c.id, c.status]));

describe("good repo", () => {
  it("passes every check and scores 100", () => {
    const report = scan(join(FIXTURES, "good"));
    expect(report.checks).toHaveLength(10);
    expect(report.checks.filter((c) => c.status !== "pass")).toEqual([]);
    expect(report.score).toBe(100);
    expect(report.fixFirst).toEqual([]);
    expect(report.repo).toBe("good-fixture");
  });
});

describe("bare repo", () => {
  it("fails the setup checks and scores low", () => {
    expect(statuses(join(FIXTURES, "bare"))).toEqual({
      "project-context": "fail",
      "commands-documented": "fail",
      "test-command": "fail",
      "typecheck-or-lint": "fail",
      ci: "fail",
      "env-example": "pass",
      "file-size": "pass",
      "git-hygiene": "fail",
      lockfile: "warn",
      secrets: "pass",
    });
    expect(scan(join(FIXTURES, "bare")).score).toBe(35);
  });

  it("lists failures before warnings, each with a fix", () => {
    const { fixFirst } = scan(join(FIXTURES, "bare"));
    expect(fixFirst.map((f) => f.status)).toEqual(["fail", "fail", "fail", "fail", "fail", "fail", "warn"]);
    for (const f of fixFirst) expect(f.fix).not.toBe("");
  });
});

describe("repo with a fake secret", () => {
  it("fails the secrets check and names the file and line", () => {
    const secrets = scan(secretRepo()).checks.find((c) => c.id === "secrets");
    expect(secrets?.status).toBe("fail");
    expect(secrets?.detail).toContain("AWS access key in src/config.js:2");
  });

  it("never prints the secret, in text or JSON", () => {
    const report = scan(secretRepo());
    expect(formatReport(report)).not.toContain(FAKE_AWS_KEY);
    expect(JSON.stringify(report)).not.toContain(FAKE_AWS_KEY);
  });

  it("does not echo a key held in a package.json script", () => {
    const pkg = JSON.stringify({ scripts: { test: `AWS_KEY=${FAKE_AWS_KEY} node --test` } });
    const report = scan(makeRepo({ "package.json": pkg }));
    expect(report.checks.find((c) => c.id === "test-command")?.status).toBe("pass");
    expect(JSON.stringify(report)).not.toContain(FAKE_AWS_KEY);
  });
});
