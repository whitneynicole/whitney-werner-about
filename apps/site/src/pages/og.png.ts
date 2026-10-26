import type { APIRoute } from "astro";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { scan } from "agent-ready";
import { getSiteMeta } from "../data/site";
import { repoRoot } from "../lib/repo-root";

// 1200x630 Open Graph card, rendered at build time: name and title from
// hero.md, score from running agent-ready on this repo. Colors from CONTEXT.md.
const WIDTH = 1200;
const HEIGHT = 630;
const require = createRequire(import.meta.url);

type Node = { type: string; props: Record<string, unknown> };
const el = (type: string, style: Record<string, unknown>, children?: unknown): Node => ({
  type,
  props: { style, children },
});

async function font(pkg: string, file: string): Promise<Buffer> {
  return readFile(require.resolve(`${pkg}/files/${file}`));
}

export const GET: APIRoute = async () => {
  const meta = await getSiteMeta();
  const report = scan(repoRoot());

  const card = el(
    "div",
    {
      width: WIDTH,
      height: HEIGHT,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: 80,
      background: "#f6f1e8",
      color: "#14171c",
      fontFamily: "Inter",
      borderTop: "16px solid #1f3a5c",
    },
    [
      el("div", { display: "flex", flexDirection: "column" }, [
        el("div", { fontFamily: "Lora", fontWeight: 600, fontSize: 88, lineHeight: 1.1 }, meta.name),
        el("div", { marginTop: 24, fontSize: 40, fontWeight: 500, color: "#1f3a5c" }, meta.title),
      ]),
      el("div", { display: "flex", alignItems: "baseline", fontSize: 32, color: "#666c76" }, [
        el("span", { fontFamily: "Lora", fontWeight: 600, fontSize: 64, color: "#1f3a5c" }, `${report.score}/100`),
        el("span", { marginLeft: 20 }, "agent-ready score of the repo behind this page"),
      ]),
    ],
  );

  const svg = await satori(card as unknown as Parameters<typeof satori>[0], {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      { name: "Lora", data: await font("@fontsource/lora", "lora-latin-600-normal.woff"), weight: 600 },
      { name: "Inter", data: await font("@fontsource/inter", "inter-latin-400-normal.woff"), weight: 400 },
      { name: "Inter", data: await font("@fontsource/inter", "inter-latin-500-normal.woff"), weight: 500 },
    ],
  });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: WIDTH } }).render().asPng();
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png" } });
};
