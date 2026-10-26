import type { Report, Status } from "./types.js";

const LABEL: Record<Status, string> = { pass: "PASS", warn: "WARN", fail: "FAIL" };

/** Plain-text report: score, a table of checks, and a fix-first list. */
export function formatReport(report: Report): string {
  const titleWidth = Math.max(...report.checks.map((c) => c.title.length), "Check".length);
  const lines = [
    `agent-ready ${report.version} - ${report.repo}`,
    "",
    `Score: ${report.score}/${report.maxScore}`,
    "",
    `  ${"Result".padEnd(6)}  ${"Check".padEnd(titleWidth)}  Detail`,
    `  ${"-".repeat(6)}  ${"-".repeat(titleWidth)}  ${"-".repeat(6)}`,
    ...report.checks.map((c) => `  ${LABEL[c.status].padEnd(6)}  ${c.title.padEnd(titleWidth)}  ${c.detail}`),
    "",
  ];
  if (report.fixFirst.length === 0) {
    lines.push("Nothing to fix. This repo is agent-ready.");
  } else {
    lines.push("Fix these first:");
    report.fixFirst.forEach((f, i) => lines.push(`  ${i + 1}. [${LABEL[f.status]}] ${f.title}: ${f.fix}`));
  }
  if (!report.passed) {
    lines.push("", `Score ${report.score} is below the minimum of ${report.min}.`);
  }
  return lines.join("\n");
}
