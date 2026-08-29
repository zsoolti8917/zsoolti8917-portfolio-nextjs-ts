#!/usr/bin/env node
/* Asserts that the generated CVs survive automated screening.
 *
 * Usage:  node cv/verify.mjs [en] [hu] [sk]      (default: all three)
 *
 * The headline check is that content-stream order and geometric order agree.
 * That single property is what a single-column layout buys you, and it is
 * exactly what the previous two-column Canva CVs failed.
 */

import { execFile } from "node:child_process";
import { readFile, unlink } from "node:fs/promises";
import { existsSync } from "node:fs";
import { promisify } from "node:util";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const execFileAsync = promisify(execFile);

const CV_DIR = fileURLToPath(new URL(".", import.meta.url));
const PUBLIC_DIR = join(CV_DIR, "..", "public");
const LOCALES = { en: "EN", hu: "HU", sk: "SK" };

/* Word-order similarity between the two extractions.
 *
 * Why a ratio and not exact equality: PDFKit's characterBoundsAtIndex is
 * unreliable for Chrome-generated PDFs — it reports glyph heights of 0.0-8.3pt
 * for characters sitting on the same baseline, and decomposed diacritics
 * (Slovak ŕ, ď, ľ) land at offsets that don't match their character index. That
 * produces a few percent of local noise no matter how the page is laid out.
 * Column interleaving, by contrast, reorders whole phrases and tanks the score.
 *
 * Measured on this repo (see cv/README.md):
 *   single-column (these CVs)      0.859 – 0.867
 *   two-column (old Canva CVs)     0.643 – 0.688
 * 0.78 sits in the empty middle with room on both sides.
 */
const MIN_ORDER_SIMILARITY = 0.78;

const words = (s) =>
  s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}@.\s-]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);

function orderSimilarity(a, b) {
  const n = a.length;
  const m = b.length;
  if (!n || !m) return 0;
  let prev = new Int32Array(m + 1);
  let cur = new Int32Array(m + 1);
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      cur[j] =
        a[i - 1] === b[j - 1]
          ? prev[j - 1] + 1
          : Math.max(prev[j], cur[j - 1]);
    }
    [prev, cur] = [cur, prev];
    cur.fill(0);
  }
  return (2 * prev[m]) / (n + m);
}

async function extract(pdf) {
  const out = join(tmpdir(), `cv-extract-${process.pid}-${Math.random()}.json`);
  await execFileAsync("osascript", [
    "-l",
    "JavaScript",
    join(CV_DIR, "extract.js"),
    pdf,
    out,
  ]);
  const data = JSON.parse(await readFile(out, "utf8"));
  await unlink(out).catch(() => {});
  return data;
}

async function checkLocale(loc) {
  const suffix = LOCALES[loc];
  const pdf = join(PUBLIC_DIR, `Varju-CV-${suffix}.pdf`);
  const content = JSON.parse(
    await readFile(join(CV_DIR, `content.${loc}.json`), "utf8")
  );

  const failures = [];
  const check = (ok, label, detail) => {
    if (!ok) failures.push(detail ? `${label}\n      ${detail}` : label);
    console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}`);
  };

  if (!existsSync(pdf)) {
    console.log(`  FAIL  ${pdf} does not exist — run node cv/build.mjs first`);
    return [`${loc}: PDF missing`];
  }

  const { pages, stream, geometric } = await extract(pdf);

  // 1 · the headline check: does the reading order survive geometric sorting?
  const sim = orderSimilarity(words(stream), words(geometric));
  check(
    sim >= MIN_ORDER_SIMILARITY,
    `reading order survives geometric sorting (${sim.toFixed(
      3
    )} >= ${MIN_ORDER_SIMILARITY})`,
    sim >= MIN_ORDER_SIMILARITY
      ? ""
      : "stream order and geometric order disagree — the page has side-by-side text somewhere."
  );

  // 2 · one page
  const wantPages = content.pages ?? 1;
  check(
    Number(pages) === wantPages,
    `page count is ${wantPages} (got ${pages})`
  );

  // 3 · the name leads the document
  const firstLine = stream.split("\n").find((l) => l.trim());
  check(
    firstLine && firstLine.trim() === content.name,
    `document opens with the name (got ${JSON.stringify(firstLine)})`
  );

  // 4 · the job title is a contiguous, matchable token.
  //     This is the check that would have caught "F r o n t e n d  D e v e l o p e r".
  check(stream.includes(content.role), `role "${content.role}" is contiguous`);

  // 5 · inside each experience entry, the employer must immediately follow the
  //     job title. The old CV failed exactly here: "Quality Assurance Tester"
  //     was followed by a project name and the dates before the real employer,
  //     which invites a parser to extract the wrong company.
  //     Search from the Experience heading onward: a job title is often a
  //     prefix of the headline role, so a naive indexOf matches the header.
  const expAt = stream.indexOf(content.headings.experience);
  let from = expAt;
  for (const job of content.experience) {
    const titleAt = stream.indexOf(job.title, from);
    const orgAt = stream.indexOf(job.org, titleAt === -1 ? from : titleAt);
    const gap = orgAt - (titleAt + job.title.length);
    check(
      titleAt !== -1 && orgAt > titleAt && gap < 40,
      `"${job.org}" immediately follows "${job.title}" (gap ${gap})`
    );
    if (orgAt !== -1) from = orgAt;
  }

  // 5b · the headline role appears before the experience section, not after
  const roleAt = stream.indexOf(content.role);
  check(
    roleAt !== -1 && roleAt < expAt,
    "headline role appears before the experience section"
  );

  // 6 · no missing-glyph or private-use codepoints (icon fonts, bad ToUnicode)
  const bad = [...stream].filter((ch) => {
    const cp = ch.codePointAt(0);
    return cp === 0xfffd || (cp >= 0xe000 && cp <= 0xf8ff);
  });
  check(bad.length === 0, `no replacement or private-use glyphs (${bad.length})`);

  // 7 · contact details
  check(stream.includes(content.contact.email), `contains ${content.contact.email}`);
  check(
    !stream.includes("zsolt.varju.rl@gmail.com"),
    "old gmail address is gone"
  );

  // 8 · every section heading survived
  for (const h of Object.values(content.headings)) {
    check(stream.includes(h), `heading "${h}" present`);
  }

  // 9 · diacritics round-tripped
  check(
    !/[?]{2,}/.test(stream) && stream.includes(content.name),
    "diacritics intact"
  );

  return failures.map((f) => `${loc}: ${f}`);
}

async function main() {
  const wanted = process.argv.slice(2).filter((a) => a in LOCALES);
  const locales = wanted.length ? wanted : Object.keys(LOCALES);

  let all = [];
  for (const loc of locales) {
    console.log(`\n${loc.toUpperCase()}  public/Varju-CV-${LOCALES[loc]}.pdf`);
    all = all.concat(await checkLocale(loc));
  }

  console.log("");
  if (all.length) {
    console.error(`${all.length} check(s) failed:\n`);
    for (const f of all) console.error(`  - ${f}`);
    process.exit(1);
  }
  console.log("All checks passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
