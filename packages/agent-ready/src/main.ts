import { statSync } from "node:fs";
import { resolve } from "node:path";
import { USAGE, UsageError, parseArgs } from "./args.js";
import { formatReport } from "./format.js";
import { scan } from "./score.js";
import { VERSION } from "./version.js";

interface Writable {
  write(chunk: string): unknown;
}

/** Runs the CLI and returns the exit code: 0 ok, 1 under --min, 2 bad usage. */
export function main(argv: string[], out: Writable = process.stdout, err: Writable = process.stderr): number {
  let opts;
  try {
    opts = parseArgs(argv);
  } catch (e) {
    if (!(e instanceof UsageError)) throw e;
    err.write(`agent-ready: ${e.message}\n\n${USAGE}\n`);
    return 2;
  }
  if (opts.help) {
    out.write(`${USAGE}\n`);
    return 0;
  }
  if (opts.version) {
    out.write(`${VERSION}\n`);
    return 0;
  }

  const root = resolve(opts.path);
  if (!isDirectory(root)) {
    err.write(`agent-ready: not a directory: ${opts.path}\n`);
    return 2;
  }

  const report = scan(root, opts.min);
  out.write(opts.json ? `${JSON.stringify(report, null, 2)}\n` : `${formatReport(report)}\n`);
  return report.passed ? 0 : 1;
}

function isDirectory(path: string): boolean {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}
