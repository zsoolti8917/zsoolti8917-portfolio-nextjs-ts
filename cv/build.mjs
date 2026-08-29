#!/usr/bin/env node
/* Builds public/Varju-CV-{EN,HU,SK}.pdf and .txt from cv/content.*.json.
 *
 * Usage:  node cv/build.mjs [en] [hu] [sk]      (default: all three)
 *
 * Why a local HTTP server instead of file:// — headless Chrome takes a
 * different resource-loading path from the interactive print dialog and is
 * unreliable about fetching self-hosted fonts over file://.
 */

import { createServer } from "node:http";
import { execFile } from "node:child_process";
import { readFile, writeFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { promisify } from "node:util";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

import { renderHtml, renderText } from "./template.mjs";

const execFileAsync = promisify(execFile);

const CV_DIR = fileURLToPath(new URL(".", import.meta.url));
const PUBLIC_DIR = join(CV_DIR, "..", "public");

const CHROME =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const LOCALES = { en: "EN", hu: "HU", sk: "SK" };

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".woff2": "font/woff2",
};

function startServer(root) {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      const rel = normalize(decodeURIComponent(req.url.split("?")[0])).replace(
        /^(\.\.[/\\])+/,
        ""
      );
      const file = join(root, rel);
      if (!file.startsWith(root) || !existsSync(file)) {
        res.writeHead(404).end("not found");
        return;
      }
      res.writeHead(200, {
        "Content-Type": MIME[extname(file)] || "application/octet-stream",
      });
      res.end(await readFile(file));
    });
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

async function main() {
  const wanted = process.argv.slice(2).filter((a) => a in LOCALES);
  const locales = wanted.length ? wanted : Object.keys(LOCALES);

  if (!existsSync(CHROME)) {
    console.error(
      `Chrome not found at:\n  ${CHROME}\nSet CHROME_PATH to override.`
    );
    process.exit(1);
  }

  const fonts = (await readdir(join(CV_DIR, "fonts"))).filter((f) =>
    f.endsWith(".woff2")
  );
  if (fonts.length === 0) {
    console.error("cv/fonts/ has no .woff2 files — see cv/README.md.");
    process.exit(1);
  }

  // 1 · render HTML + text
  for (const loc of locales) {
    const content = JSON.parse(
      await readFile(join(CV_DIR, `content.${loc}.json`), "utf8")
    );
    await writeFile(join(CV_DIR, `render.${loc}.html`), renderHtml(content));
    await writeFile(
      join(PUBLIC_DIR, `Varju-CV-${LOCALES[loc]}.txt`),
      renderText(content)
    );
    console.log(`rendered  ${loc}  ->  cv/render.${loc}.html  +  .txt`);
  }

  // 2 · print each to PDF
  const server = await startServer(CV_DIR);
  const { port } = server.address();

  try {
    for (const loc of locales) {
      const out = join(PUBLIC_DIR, `Varju-CV-${LOCALES[loc]}.pdf`);
      await execFileAsync(CHROME, [
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--no-pdf-header-footer",
        "--export-tagged-pdf",
        "--generate-pdf-document-outline",
        "--virtual-time-budget=10000",
        `--print-to-pdf=${out}`,
        `http://127.0.0.1:${port}/render.${loc}.html`,
      ]);
      console.log(`printed   ${loc}  ->  public/Varju-CV-${LOCALES[loc]}.pdf`);
    }
  } finally {
    server.close();
  }

  console.log("\nNow run:  node cv/verify.mjs");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
