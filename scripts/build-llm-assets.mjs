#!/usr/bin/env node
/**
 * Generates the machine-readable copies of this site:
 *
 *   public/llms.txt     navigational index, per https://llmstxt.org
 *   public/cv.md        the whole CV as markdown — the "everything" file
 *   public/profile.json a plain structured profile (not schema.org)
 *
 * Why: the AI crawlers that answer "who is Zsolt Varju?" — GPTBot,
 * OAI-SearchBot, ChatGPT-User, ClaudeBot, PerplexityBot, Meta-ExternalAgent —
 * fetch raw HTML and never execute JavaScript. Most of this site survives that
 * because it is statically generated, with one real gap: the per-project
 * write-ups live in a modal that is only mounted on click
 * (`ProjectModal.tsx`: `if (!isOpen) return <></>`), so a crawler sees the
 * project cards and none of the detail. cv.md closes that gap as a document
 * in its own right rather than as hidden page text.
 *
 * English only, by design — it is the default locale, and llms.txt points at
 * /sk and /hu for the other two.
 *
 * Source of truth is `src/messages/en.json` plus the curated project order in
 * `src/components/projects/Projects.tsx`. Nothing is retyped here, so these
 * files cannot drift away from the site. Run: npm run llm:build
 *
 * No dependencies, and it never touches .next — safe to run during a build.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Mirrors SITE_URL in src/components/seo/site.ts — a .mjs script cannot
 *  import a .ts module. Change the two together. */
const SITE = "https://zsoltvarjuprojects.com";

const LOCALES = [
  { code: "sk", label: "Slovak" },
  { code: "hu", label: "Hungarian" },
];

const CV_PDFS = [
  { locale: "English", href: "/Varju-CV-EN.pdf" },
  { locale: "Slovak", href: "/Varju-CV-SK.pdf" },
  { locale: "Hungarian", href: "/Varju-CV-HU.pdf" },
];

const read = (relative) => readFileSync(join(ROOT, relative), "utf8");
const readJson = (relative) => JSON.parse(read(relative));

// ---------------------------------------------------------------------------
// Reading the curated project list out of Projects.tsx
// ---------------------------------------------------------------------------

/** Index of the closing quote of the string literal starting at `start`. */
const endOfString = (source, start) => {
  const quote = source[start];
  for (let i = start + 1; i < source.length; i += 1) {
    if (source[i] === "\\") {
      i += 1;
      continue;
    }
    if (source[i] === quote) return i;
  }
  throw new Error("Unterminated string literal in Projects.tsx");
};

/**
 * `PROJECTS` is the ordered, curated list — order, live links and repository
 * links live there and nowhere else. It is a plain array literal (only
 * strings, numbers, booleans and comments), so evaluating it is enough; a
 * TypeScript parser would be a dependency for no gain. The scan skips string
 * literals and comments so a bracket inside either can't end it early.
 */
const readProjectDefs = () => {
  const source = read("src/components/projects/Projects.tsx");
  const declaration = source.indexOf("export const PROJECTS");
  if (declaration === -1) {
    throw new Error("PROJECTS is no longer exported from Projects.tsx");
  }

  // Skip past the `=`, so the `[]` in the `ProjectDef[]` type annotation is
  // not mistaken for the start of the array literal.
  const assignment = source.indexOf("=", declaration);
  const open = source.indexOf("[", assignment);
  let depth = 0;
  let close = -1;

  for (let i = open; i < source.length; i += 1) {
    const char = source[i];
    if (char === '"' || char === "'" || char === "`") {
      i = endOfString(source, i);
    } else if (char === "/" && source[i + 1] === "/") {
      const newline = source.indexOf("\n", i);
      i = newline === -1 ? source.length : newline;
    } else if (char === "/" && source[i + 1] === "*") {
      i = source.indexOf("*/", i) + 1;
    } else if (char === "[") {
      depth += 1;
    } else if (char === "]") {
      depth -= 1;
      if (depth === 0) {
        close = i;
        break;
      }
    }
  }

  if (close === -1) throw new Error("Could not find the end of PROJECTS");

  // eslint-disable-next-line no-new-func
  const parsed = new Function(`return ${source.slice(open, close + 1)};`)();
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("Parsed PROJECTS as an empty list — the literal moved");
  }
  return parsed;
};

// ---------------------------------------------------------------------------
// Shaping
// ---------------------------------------------------------------------------

const messages = readJson("src/messages/en.json");
const defs = readProjectDefs();

const { meta, About: about, Stats: stats, Contact: contact, experience } = messages;

const name = meta.title.split("|")[0].trim();
const role = experience.jobs[0]?.jobTitle ?? "";
const generatedOn = new Date().toISOString().slice(0, 10);

/**
 * `About.intro` starts mid-word ("ey there. I'm Zsolt...") because the page
 * renders `About.firstLetter` separately as a drop cap (see
 * about/parts/AboutProse.tsx). Reassemble the sentence, or every generated
 * file opens with a typo.
 */
const intro = `${about.firstLetter}${about.intro}`;

/** Splits a "a | b | c" list message the way Projects.tsx renders it. */
const bullets = (value) =>
  String(value)
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);

const tech = (value) =>
  String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const projects = defs.map((def) => {
  const message = messages.projects[def.key];
  if (!message) throw new Error(`No 'projects.${def.key}' message for the curated list`);

  const modal = message.modalContent ?? {};
  const paraCount = def.paras ?? 3;
  const paras = [];
  for (let n = 1; n <= paraCount; n += 1) {
    if (modal[`para${n}`]) paras.push(modal[`para${n}`]);
  }

  return {
    key: def.key,
    name: message.title,
    description: message.description,
    tech: tech(message.tech),
    url: def.projectLink ?? null,
    repository: def.code ?? null,
    image: def.imgSrc ? `${SITE}${def.imgSrc}` : null,
    detail: {
      paragraphs: paras,
      featuresLabel: modal.keyFeatures ?? null,
      features: modal.featuresList ? bullets(modal.featuresList) : [],
      techLabel: def.techList ? modal.technologiesList ?? null : null,
      techDetail: def.techList && modal.techList ? bullets(modal.techList) : [],
    },
  };
});

/** Education is not in the site messages — it only exists in the CV pipeline
 *  (`cv/content.en.json`, see cv/README.md). Optional on purpose: if that
 *  file moves, the CV loses a section instead of the build failing. */
const education = (() => {
  const path = "cv/content.en.json";
  if (!existsSync(join(ROOT, path))) return [];
  return readJson(path).education ?? [];
})();

// ---------------------------------------------------------------------------
// public/cv.md
// ---------------------------------------------------------------------------

const buildCv = () => {
  const out = [];
  const push = (...lines) => out.push(...lines, "");

  push(`# ${name} — ${role}`);
  push(meta.description);

  push("## At a glance");
  push(
    [
      `- **${about.facts.basedLabel}:** ${about.facts.basedValue}`,
      `- **${about.facts.fromLabel}:** ${about.facts.fromValue}`,
      `- **${about.facts.sinceLabel}:** ${about.facts.sinceValue}`,
      `- **Email:** ${contact.email}`,
      `- **LinkedIn:** ${contact.linkedinUrl}`,
      `- **GitHub:** ${contact.githubUrl}`,
      `- **Website:** ${SITE}/`,
    ].join("\n")
  );

  push("## Summary");
  push(`${intro}\n\n${about.currentWork}`);

  push(`## ${about.currently.label}`);
  push(`**${about.currently.role}**\n\n${about.currently.detail}`);

  push(`## ${experience.title}`);
  for (const job of experience.jobs) {
    push(`### ${job.jobTitle} — ${job.companyName}`);
    push(`${job.location} · ${job.dates}`);
    push(
      job.responsibilities
        .map((item) => `- **${item.title}** ${item.description}`)
        .join("\n")
    );
    push(`Skills: ${job.skills.join(", ")}`);
  }

  push("## Projects");
  push(
    `${projects.length} projects, in the order they appear on ${SITE}/#projects.`
  );
  for (const project of projects) {
    push(`### ${project.name}`);

    const links = [];
    if (project.url) links.push(`[Live](${project.url})`);
    if (project.repository) links.push(`[Source](${project.repository})`);
    push(
      [
        `**Tech:** ${project.tech.join(", ")}`,
        links.length ? `**Links:** ${links.join(" · ")}` : null,
      ]
        .filter(Boolean)
        .join("  \n")
    );

    push(project.description);

    const [first, ...rest] = project.detail.paragraphs;
    if (first) push(first);
    if (project.detail.features.length) {
      push(project.detail.featuresLabel ?? "Key features:");
      push(project.detail.features.map((item) => `- ${item}`).join("\n"));
    }
    const [second, ...tail] = rest;
    if (second) push(second);
    if (project.detail.techDetail.length) {
      push(project.detail.techLabel ?? "Technologies:");
      push(project.detail.techDetail.map((item) => `- ${item}`).join("\n"));
    }
    for (const paragraph of tail) push(paragraph);
  }

  push("## Skills");
  for (const group of stats.stack) {
    push(`### ${group.label}`);
    push(group.items.join(", "));
  }
  push(`### ${stats.aiLlm.title}`);
  push(stats.aiLlm.chips.join(", "));
  push(`### ${stats.triedOut.title}`);
  push(stats.triedOut.chips.join(", "));

  if (education.length) {
    push("## Education");
    push(
      education
        .map((entry) =>
          [
            `- **${entry.degree}** — ${entry.org} (${entry.dates})`,
            entry.note ? `  ${entry.note}` : null,
          ]
            .filter(Boolean)
            .join("\n")
        )
        .join("\n")
    );
  }

  push(`## ${about.certificationsLabel}`);
  push(
    stats.certifications
      .map(
        (item) =>
          `- ${item.name} — ${item.issuer}${item.date ? ` (${item.date})` : ""}`
      )
      .join("\n")
  );

  push(`## ${about.languagesLabel}`);
  push(
    stats.languages.map((item) => `- ${item.name} — ${item.level}`).join("\n")
  );

  push(`## ${contact.title}`);
  push(
    [
      `- Email: ${contact.email}`,
      `- LinkedIn: ${contact.linkedinUrl}`,
      `- GitHub: ${contact.githubUrl}`,
      `- Portfolio: ${SITE}/`,
      ...CV_PDFS.map((pdf) => `- CV, ${pdf.locale} (PDF): ${SITE}${pdf.href}`),
    ].join("\n")
  );

  push("---");
  push(
    `This file is generated from the site's own content (\`npm run llm:build\`), last on ${generatedOn}. ` +
      `Slovak and Hungarian versions of the site are at ${SITE}/sk and ${SITE}/hu.`
  );

  return `${out.join("\n").trimEnd()}\n`;
};

// ---------------------------------------------------------------------------
// public/llms.txt
// ---------------------------------------------------------------------------

const buildLlms = () => {
  const out = [];
  const push = (...lines) => out.push(...lines, "");

  push(`# ${name}`);
  push(`> ${meta.description}`);
  push(`${about.currently.role}. ${about.currently.detail}`);
  push(
    `Every page linked below is server-rendered and needs no JavaScript. The one gap: ` +
      `each project's detailed write-up opens in a modal, so /cv.md is the place to read those in full.`
  );

  push("## Start here");
  push(
    [
      `- [Full CV (markdown)](${SITE}/cv.md): everything in one file — summary, both roles with responsibilities, all ${projects.length} projects in full, skills, certifications, languages, contact.`,
      `- [Structured profile (JSON)](${SITE}/profile.json): the same content as data, for parsing rather than reading.`,
      `- [Portfolio home page](${SITE}/): the site itself — about, projects, experience, contact, all server-rendered.`,
    ].join("\n")
  );

  push("## Projects");
  push(
    projects
      .map((project) => {
        const href = project.url ?? project.repository ?? `${SITE}/#projects`;
        // Drop the sentence-final period so the em-dash before the tech
        // list doesn't read as a second, dangling clause.
        const note = project.description.replace(/\.$/, "");
        return `- [${project.name}](${href}): ${note} — ${project.tech.join(", ")}`;
      })
      .join("\n")
  );

  push("## CV downloads");
  push(
    CV_PDFS.map(
      (pdf) => `- [CV in ${pdf.locale} (PDF)](${SITE}${pdf.href}): the same CV, typeset for print.`
    ).join("\n")
  );

  push("## Other languages");
  push(
    LOCALES.map(
      (locale) =>
        `- [${locale.label} version of this site](${SITE}/${locale.code}): the same content in ${locale.label}. English is the default locale and lives at the root.`
    ).join("\n")
  );

  push("## Optional");
  push(
    [
      `- [LinkedIn](${contact.linkedinUrl}): work history and endorsements.`,
      `- [GitHub](${contact.githubUrl}): public repositories, including the source of this site.`,
      `- [Email](mailto:${contact.email}): ${contact.email}.`,
    ].join("\n")
  );

  return `${out.join("\n").trimEnd()}\n`;
};

// ---------------------------------------------------------------------------
// public/profile.json
// ---------------------------------------------------------------------------

const buildProfile = () => ({
  name,
  title: role,
  headline: meta.title,
  summary: `${intro}\n\n${about.currentWork}`,
  shortDescription: meta.description,
  url: `${SITE}/`,
  language: "en",
  updated: generatedOn,
  generatedFrom: "src/messages/en.json",
  localizedVersions: LOCALES.map((locale) => ({
    language: locale.label,
    code: locale.code,
    url: `${SITE}/${locale.code}`,
  })),
  location: {
    label: about.facts.basedValue,
    city: about.facts.basedValue.split(",")[0].trim(),
    country: "CZ",
    origin: about.facts.fromValue,
  },
  inSoftwareSince: about.facts.sinceValue,
  contact: {
    email: contact.email,
    linkedin: contact.linkedinUrl,
    github: contact.githubUrl,
    website: `${SITE}/`,
  },
  current: {
    role: about.currently.role,
    detail: about.currently.detail,
  },
  experience: experience.jobs.map((job) => ({
    company: job.companyName,
    title: job.jobTitle,
    location: job.location,
    dates: job.dates,
    responsibilities: job.responsibilities.map((item) => ({
      // The messages carry the label with a trailing colon; drop it so the
      // JSON reads as data rather than as a rendered bullet.
      area: item.title.replace(/:$/, ""),
      description: item.description,
    })),
    skills: job.skills,
  })),
  projects: projects.map((project) => ({
    name: project.name,
    description: project.description,
    tech: project.tech,
    url: project.url,
    repository: project.repository,
    highlights: project.detail.features,
  })),
  skills: {
    groups: stats.stack.map((group) => ({
      label: group.label,
      items: group.items,
    })),
    // Stable keys, translated labels — a JSON key should not change when the
    // copy does.
    ai: {
      label: stats.aiLlm.title,
      items: stats.aiLlm.chips,
    },
    exploratory: {
      label: stats.triedOut.title,
      items: stats.triedOut.chips,
    },
  },
  education,
  certifications: stats.certifications.map((item) => ({
    name: item.name,
    issuer: item.issuer,
    date: item.date || null,
  })),
  languages: stats.languages,
  documents: {
    cvMarkdown: `${SITE}/cv.md`,
    llmsTxt: `${SITE}/llms.txt`,
    cvPdf: Object.fromEntries(
      CV_PDFS.map((pdf) => [pdf.locale.toLowerCase(), `${SITE}${pdf.href}`])
    ),
  },
});

// ---------------------------------------------------------------------------

const outputs = [
  ["public/llms.txt", buildLlms()],
  ["public/cv.md", buildCv()],
  ["public/profile.json", `${JSON.stringify(buildProfile(), null, 2)}\n`],
];

for (const [relative, contents] of outputs) {
  writeFileSync(join(ROOT, relative), contents, "utf8");
  console.log(
    `  ${relative.padEnd(20)} ${Buffer.byteLength(contents).toLocaleString("en-US")} bytes`
  );
}

console.log(`\nGenerated from src/messages/en.json (${projects.length} projects).`);
