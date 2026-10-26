export interface Options {
  path: string;
  json: boolean;
  min: number;
  help: boolean;
  version: boolean;
}

export const USAGE = `Usage: agent-ready [path] [--json] [--min <score>]

Scores how ready a repository is for AI coding agents (0-100).

Options:
  --json         Print the report as JSON
  --min <score>  Exit 1 when the score is below this (default 0)
  -h, --help     Show this help
  -v, --version  Show the version`;

export class UsageError extends Error {}

/** Hand-rolled on purpose: four flags do not justify a dependency. */
export function parseArgs(argv: string[]): Options {
  const opts: Options = { path: ".", json: false, min: 0, help: false, version: false };
  let pathSeen = false;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i] as string;
    if (arg === "--json") opts.json = true;
    else if (arg === "-h" || arg === "--help") opts.help = true;
    else if (arg === "-v" || arg === "--version") opts.version = true;
    else if (arg === "--min" || arg.startsWith("--min=")) {
      const value = arg === "--min" ? argv[++i] : arg.slice("--min=".length);
      opts.min = parseMin(value);
    } else if (arg.startsWith("-")) {
      throw new UsageError(`Unknown option: ${arg}`);
    } else if (pathSeen) {
      throw new UsageError(`Unexpected argument: ${arg}`);
    } else {
      opts.path = arg;
      pathSeen = true;
    }
  }
  return opts;
}

function parseMin(value: string | undefined): number {
  const min = Number(value);
  if (value === undefined || value.trim() === "" || !Number.isFinite(min) || min < 0) {
    throw new UsageError(`--min needs a number of 0 or more, got: ${value ?? "nothing"}`);
  }
  return min;
}
