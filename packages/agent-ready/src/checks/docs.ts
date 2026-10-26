import type { Check } from "../types.js";
import { contextFiles, fail, list, pass, readmeFile, warn } from "./helpers.js";

const MIN_CONTEXT_CHARS = 300;

export const projectContext: Check = {
  id: "project-context",
  title: "Project context",
  run(repo) {
    const files = contextFiles(repo);
    if (files.length === 0) {
      return fail(
        "No agent context file (CONTEXT.md, CLAUDE.md, AGENTS.md, .cursorrules, ...)",
        "Add AGENTS.md with the stack, commands, conventions and hard rules.",
      );
    }
    const sizes = files.map((f) => ({ file: f, chars: (repo.read(f) ?? "").trim().length }));
    const best = sizes.reduce((a, b) => (b.chars > a.chars ? b : a));
    if (best.chars > MIN_CONTEXT_CHARS) {
      return pass(`${best.file} (${best.chars.toLocaleString("en-US")} chars)`);
    }
    return warn(
      `${best.file} is only ${best.chars} chars`,
      `Expand ${best.file} past ${MIN_CONTEXT_CHARS} chars: stack, commands, conventions, rules.`,
    );
  },
};

const PM = String.raw`(?:npm|pnpm|yarn|bun)`;

/** Patterns that count as naming each command, across common ecosystems. */
const COMMANDS: Record<"install" | "test" | "build", RegExp> = {
  install: new RegExp(
    String.raw`\b${PM}\s+(?:install|i|ci)\b|\b(?:pip|poetry|bundle|composer)\s+install\b|\buv\s+sync\b|\bgo\s+mod\s+download\b|\bmake\s+install\b`,
  ),
  test: new RegExp(
    String.raw`\b${PM}\s+(?:run\s+)?test\b|\bpytest\b|\bgo\s+test\b|\bcargo\s+test\b|\bmake\s+test\b|\bvitest\b|\bjest\b`,
  ),
  build: new RegExp(
    String.raw`\b${PM}\s+(?:run\s+)?build\b|\bgo\s+build\b|\bcargo\s+build\b|\bmake\s+build\b|\bpython\s+-m\s+build\b`,
  ),
};

export const commandsDocumented: Check = {
  id: "commands-documented",
  title: "Commands documented",
  run(repo) {
    const readme = readmeFile(repo);
    const sources = [...contextFiles(repo), ...(readme ? [readme] : [])];
    if (sources.length === 0) {
      return fail("No context file or README to read commands from", "Add a README that lists install, test and build commands.");
    }
    const text = sources.map((f) => repo.read(f) ?? "").join("\n");
    const names = Object.keys(COMMANDS) as Array<keyof typeof COMMANDS>;
    const missing = names.filter((name) => !COMMANDS[name].test(text));
    if (missing.length === 0) return pass(`install, test and build found in ${list(sources)}`);
    const fix = `Name the exact ${list(missing)} command${missing.length > 1 ? "s" : ""} in ${sources[0]}.`;
    if (missing.length === names.length) return fail("No install, test or build command documented", fix);
    return warn(`Missing ${list(missing)} command${missing.length > 1 ? "s" : ""}`, fix);
  },
};
