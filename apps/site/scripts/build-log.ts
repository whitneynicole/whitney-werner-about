// Builds src/data/build-log.json from this repo's own history: the squash-merged
// `T0X:` commits on main plus each merged PR's data from GitHub (`gh`).
// Runs as `prebuild`. If git or gh can't answer (Vercel's shallow clone, no gh
// auth), it keeps the last committed JSON and exits 0 so the build still runs.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const OUT = fileURLToPath(new URL("../src/data/build-log.json", import.meta.url));
const TICKET = /\b(T\d{2}):/;
const PR_REF = /\(#(\d+)\)\s*$/;
// The ticket spec: a rebase or conflict fix shows up in commit messages.
// GitHub closing keywords ("Resolves #12") are stripped first so they don't count.
const CONFLICT = /\b(rebas(e|ed|ing)|resolv(e|ed|es|ing))\b/i;
const CLOSES_ISSUE = /\bresolv(e|ed|es)\s+#\d+/gi;

interface PrCommit {
  authoredDate: string;
  messageHeadline: string;
  messageBody: string;
}

interface Pr {
  number: number;
  title: string;
  url: string;
  headRefName: string;
  createdAt: string;
  mergedAt: string;
  commits: PrCommit[];
  files: { path: string }[];
}

interface TicketRun {
  ticket: string;
  title: string;
  wave: number | null;
  prs: { number: number; url: string }[];
  branches: string[];
  firstCommitAt: string;
  mergedAt: string;
  durationMinutes: number;
  commits: number;
  files: string[];
  conflictFix: boolean;
  parallelWith: string[];
}

interface BuildLog {
  repoUrl: string;
  tickets: TicketRun[];
}

function run(cmd: string, args: string[]): string {
  return execFileSync(cmd, args, {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function mainRef(): string {
  for (const ref of ["origin/main", "main"]) {
    try {
      run("git", ["rev-parse", "--verify", "--quiet", ref]);
      return ref;
    } catch {
      // try the next ref
    }
  }
  throw new Error("no main branch found");
}

/** PR number -> ticket number, for every `T0X: ... (#N)` squash commit on main. */
function ticketCommitsOnMain(): Map<number, string> {
  if (run("git", ["rev-parse", "--is-shallow-repository"]).trim() === "true") {
    throw new Error("shallow clone, history is incomplete");
  }
  const subjects = run("git", ["log", mainRef(), "--format=%s"]).split("\n");
  const byPr = new Map<number, string>();
  for (const subject of subjects) {
    const ticket = TICKET.exec(subject)?.[1];
    const pr = PR_REF.exec(subject)?.[1];
    if (ticket && pr) byPr.set(Number(pr), ticket);
  }
  return byPr;
}

// GitHub caps nodes per query; with commits + files, 50 PRs already exceeds it. This repo has 8 tickets.
function mergedPrs(): Pr[] {
  const fields = "number,title,url,headRefName,createdAt,mergedAt,commits,files";
  const json = run("gh", ["pr", "list", "--state", "merged", "--limit", "30", "--json", fields]);
  return JSON.parse(json) as Pr[];
}

/** "feat: T03: Hero sections (Wave 1) (#2)" -> { title: "Hero sections", wave: 1 } */
function cleanTitle(raw: string): { title: string; wave: number | null } {
  const wave = /\(Wave (\d+)\)/i.exec(raw)?.[1];
  const title = raw
    .replace(/^.*?\bT\d{2}:\s*/, "")
    .replace(/\s*\(Wave \d+\)/i, "")
    .replace(PR_REF, "")
    .trim();
  return { title, wave: wave ? Number(wave) : null };
}

function minutesBetween(from: string, to: string): number {
  return Math.max(0, Math.round((Date.parse(to) - Date.parse(from)) / 60_000));
}

function overlaps(a: TicketRun, b: TicketRun): boolean {
  return Date.parse(a.firstCommitAt) < Date.parse(b.mergedAt) &&
    Date.parse(b.firstCommitAt) < Date.parse(a.mergedAt);
}

function buildLog(byPr: Map<number, string>, prs: Pr[]): BuildLog {
  const grouped = new Map<string, Pr[]>();
  for (const pr of prs) {
    const ticket = byPr.get(pr.number);
    if (!ticket) continue;
    grouped.set(ticket, [...(grouped.get(ticket) ?? []), pr]);
  }

  const tickets: TicketRun[] = [...grouped].map(([ticket, group]) => {
    group.sort((a, b) => a.number - b.number);
    const commits = group.flatMap((pr) => pr.commits);
    const starts = commits.map((c) => c.authoredDate).concat(group.map((pr) => pr.createdAt));
    const firstCommitAt = starts.reduce((a, b) => (Date.parse(a) <= Date.parse(b) ? a : b));
    const mergedAt = group.map((pr) => pr.mergedAt).reduce((a, b) => (a >= b ? a : b));
    const first = group[0] as Pr;
    return {
      ticket,
      ...cleanTitle(first.title),
      prs: group.map((pr) => ({ number: pr.number, url: pr.url })),
      branches: [...new Set(group.map((pr) => pr.headRefName))],
      firstCommitAt,
      mergedAt,
      durationMinutes: minutesBetween(firstCommitAt, mergedAt),
      commits: commits.length,
      files: [...new Set(group.flatMap((pr) => pr.files.map((f) => f.path)))].sort(),
      conflictFix: commits.some((c) =>
        CONFLICT.test(`${c.messageHeadline}\n${c.messageBody}`.replace(CLOSES_ISSUE, ""))),
      parallelWith: [],
    };
  });

  tickets.sort((a, b) => a.firstCommitAt.localeCompare(b.firstCommitAt) || a.ticket.localeCompare(b.ticket));
  for (const t of tickets) {
    t.parallelWith = tickets.filter((o) => o !== t && overlaps(t, o)).map((o) => o.ticket);
  }

  const anyUrl = prs[0]?.url ?? "";
  return { repoUrl: anyUrl.replace(/\/pull\/\d+$/, ""), tickets };
}

function main(): void {
  let log: BuildLog;
  try {
    log = buildLog(ticketCommitsOnMain(), mergedPrs());
    if (log.tickets.length === 0) throw new Error("no merged ticket PRs found");
  } catch (err) {
    const reason = err instanceof Error ? err.message.split("\n")[0] : String(err);
    const kept = existsSync(OUT) ? "kept the committed build-log.json" : "no build-log.json to keep";
    console.warn(`build-log: ${kept} (${reason})`);
    return;
  }
  const next = `${JSON.stringify(log, null, 2)}\n`;
  if (existsSync(OUT) && readFileSync(OUT, "utf8") === next) {
    console.log(`build-log: up to date (${log.tickets.length} tickets)`);
    return;
  }
  writeFileSync(OUT, next);
  console.log(`build-log: wrote ${log.tickets.length} tickets`);
}

main();
