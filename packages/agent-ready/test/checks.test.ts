import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { FAKE_AWS_KEY, check, makeRepo } from "./helpers.js";

const LONG = "x".repeat(301);
// Built at runtime so this repo's own scan does not see these as env reads.
const ENV = ["process", "env"].join(".");

describe("project context", () => {
  it("warns when the context file is short", () => {
    expect(check(makeRepo({ "CLAUDE.md": "Be nice." }), "project-context").status).toBe("warn");
  });

  it("passes on a long .cursorrules", () => {
    expect(check(makeRepo({ ".cursorrules": LONG }), "project-context").status).toBe("pass");
  });
});

describe("commands documented", () => {
  it("warns and names what is missing", () => {
    const result = check(makeRepo({ "README.md": "Run `pnpm install` then `pnpm test`." }), "commands-documented");
    expect(result.status).toBe("warn");
    expect(result.detail).toBe("Missing build command");
  });
});

describe("test command", () => {
  it("ignores the npm init placeholder", () => {
    const pkg = JSON.stringify({ scripts: { test: 'echo "Error: no test specified" && exit 1' } });
    expect(check(makeRepo({ "package.json": pkg }), "test-command").status).toBe("fail");
  });

  it("detects pytest and go test", () => {
    expect(check(makeRepo({ "pyproject.toml": "[tool.pytest.ini_options]\n" }), "test-command").status).toBe("pass");
    expect(check(makeRepo({ "go.mod": "module x\n", "x_test.go": "package x\n" }), "test-command").status).toBe("pass");
  });
});

describe("ci", () => {
  it("warns when no workflow runs on pull_request", () => {
    const repo = makeRepo({ ".github/workflows/deploy.yml": "on:\n  push:\n" });
    expect(check(repo, "ci").status).toBe("warn");
  });
});

describe("env example", () => {
  it("fails when code reads process.env without an example", () => {
    const repo = makeRepo({ "src/a.ts": `const { TOKEN } = ${ENV};\n` });
    expect(check(repo, "env-example").status).toBe("fail");
  });

  it("accepts an example in a parent folder and ignores prose", () => {
    const repo = makeRepo({
      "apps/api/.env.example": "TOKEN=\n",
      "apps/api/src/a.ts": `export const t = ${ENV}.TOKEN;\n`,
      "lib/doc.ts": `// mentions "${ENV}" in passing\n`,
    });
    expect(check(repo, "env-example").status).toBe("pass");
  });
});

describe("file size", () => {
  it("warns on source files over 400 lines and skips dist and node_modules", () => {
    const big = "let a = 1;\n".repeat(401);
    const repo = makeRepo({ "src/big.ts": big, "dist/big.js": big, "node_modules/x/big.js": big });
    const result = check(repo, "file-size");
    expect(result.status).toBe("warn");
    expect(result.detail).toBe("1 file(s) over 400 lines: src/big.ts (401)");
  });
});

describe("git hygiene", () => {
  it("accepts common pattern spellings and warns on gaps", () => {
    expect(check(makeRepo({ ".gitignore": "/node_modules/\n.env*\n" }), "git-hygiene").status).toBe("pass");
    const result = check(makeRepo({ ".gitignore": "node_modules\n" }), "git-hygiene");
    expect(result.status).toBe("warn");
    expect(result.fix).toBe("Add .env to .gitignore.");
  });
});

describe("lockfile", () => {
  it("fails on two package-manager lockfiles", () => {
    const repo = makeRepo({ "package.json": "{}", "yarn.lock": "", "package-lock.json": "{}" });
    expect(check(repo, "lockfile").status).toBe("fail");
  });

  it("fails on package.json with no lockfile", () => {
    expect(check(makeRepo({ "package.json": "{}" }), "lockfile").status).toBe("fail");
  });
});

describe("secrets", () => {
  it("only counts files git would commit", () => {
    const repo = makeRepo({ ".gitignore": ".env\n", ".env": `KEY=${FAKE_AWS_KEY}\n`, "a.js": "export {};\n" });
    execFileSync("git", ["init", "-q"], { cwd: repo });
    execFileSync("git", ["add", "."], { cwd: repo });
    expect(check(repo, "secrets").status).toBe("pass");
  });

  it("flags a private key block", () => {
    const pem = ["-----BEGIN", "RSA PRIVATE KEY-----"].join(" ");
    expect(check(makeRepo({ "id_rsa": `${pem}\nabc\n` }), "secrets").status).toBe("fail");
  });
});
