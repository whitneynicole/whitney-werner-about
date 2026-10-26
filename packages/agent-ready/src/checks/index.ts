import type { Check } from "../types.js";
import { commandsDocumented, projectContext } from "./docs.js";
import { envExample, fileSize, gitHygiene, secrets } from "./hygiene.js";
import { ci, lockfile, testCommand, typecheckOrLint } from "./tooling.js";

/** Every check, in report order. Each is worth an equal share of 100. */
export const CHECKS: Check[] = [
  projectContext,
  commandsDocumented,
  testCommand,
  typecheckOrLint,
  ci,
  envExample,
  fileSize,
  gitHygiene,
  lockfile,
  secrets,
];
