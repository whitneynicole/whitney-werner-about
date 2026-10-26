# T02: Build the `agent-ready` CLI (Wave 1)

## Goal
A small TypeScript CLI that scores how ready a repository is for AI coding agents, then explains what to fix. This is the tool I'd want at every customer on day one.

## Usage
```
npx agent-ready [path] [--json]
```

## Checks (each scored pass / warn / fail, with a one-line fix)
1. **Project context:** a context file for agents exists (`PROJECT_CONTEXT.md`, `CLAUDE.md`, `AGENTS.md`, `.cursorrules`, or similar) and is over 300 characters.
2. **Commands documented:** the context file or README names install, test, and build commands.
3. **Test command:** `package.json` has a `test` script (or `pytest`/`go test` detected).
4. **Typecheck or lint:** a `typecheck` or `lint` script exists.
5. **CI:** `.github/workflows/*.yml` exists and runs on `pull_request`.
6. **Env example:** if code reads `process.env`, a `.env.example` exists.
7. **File size:** warn on source files over 400 lines (agents lose context in large files).
8. **Git hygiene:** `.gitignore` exists and covers `node_modules` and `.env`.
9. **Lockfile:** exactly one package-manager lockfile.
10. **Secrets:** fail if a committed file looks like it holds a secret (simple regex for common key prefixes). Never print the secret itself.

## Output
- Human-readable: score out of 100, a table of checks, and a "fix these first" list.
- `--json`: the same data as JSON, for CI and for the website.
- Exit code 1 if the score is under a `--min` threshold (default 0).

## Engineering
- TypeScript strict, no runtime dependencies beyond Node's standard library (a tiny arg parser is fine if justified).
- Walk the file system with a skip list (`node_modules`, `.git`, `dist`, `.astro`), and stay fast on big repos.
- Vitest tests with fixture folders for a good repo, a bare repo, and a repo with a fake secret.

## Files
`packages/agent-ready/**` only.

## Done when
- `pnpm --filter agent-ready test` passes.
- `pnpm agent-ready .` prints a score for this repo.
- `pnpm agent-ready . --json > apps/site/src/data/agent-ready.json` works (T05 reads this file).
