#!/usr/bin/env node
/* Screenshots scripts/og-template.html into public/og.png (1200×630), using
 * the same local-Chrome convention as cv/build.mjs. Run on demand via
 * `npm run og:build` and commit the PNG — it is not part of `npm run build`.
 */

import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { promisify } from "node:util";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);

const ROOT = fileURLToPath(new URL("..", import.meta.url));

const CHROME =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

if (!existsSync(CHROME)) {
  console.error(`Chrome not found at:\n  ${CHROME}\nSet CHROME_PATH to override.`);
  process.exit(1);
}

const out = join(ROOT, "public", "og.png");

await execFileAsync(CHROME, [
  "--headless=new",
  "--disable-gpu",
  "--no-sandbox",
  "--hide-scrollbars",
  "--force-device-scale-factor=1",
  "--window-size=1200,630",
  `--screenshot=${out}`,
  `file://${join(ROOT, "scripts", "og-template.html")}`,
]);

console.log("wrote public/og.png");
