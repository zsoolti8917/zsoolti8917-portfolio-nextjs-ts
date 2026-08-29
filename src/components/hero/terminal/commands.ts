import type { HeroTerminalCopy } from "../types";
import type { TerminalData } from "./useTerminalData";
import { blank, seg, t, type Line } from "./model";

export type Effect = "cv" | "contact" | "clear" | "page";

export interface CommandResult {
  lines: Line[];
  effect?: Effect;
}

export interface CommandContext {
  copy: HeroTerminalCopy;
  data: TerminalData;
  /** ICU formatter bound to the `hero.terminal` namespace. */
  fmt: (key: string, values: Record<string, string>) => string;
}

/**
 * The announced command set. Deliberately small.
 *
 * A prompt promises "type anything and I'll understand", which no shell of this
 * size can honour. The mitigation used by novice-friendly parser games is a
 * REDUCED verb set that is always visible — so the promise shrinks to something
 * the program can actually keep. Everything here is also reachable by clicking.
 */
export const COMMANDS = [
  "about", "projects", "experience", "skills",
  "certifications", "languages", "contact", "cv", "find", "help", "clear",
] as const;

/** The buttons under the prompt. Not `help` — a recruiter doesn't want help, they want answers. */
export const CHIPS = ["about", "projects", "experience", "skills", "contact", "cv"] as const;

/**
 * What a non-technical visitor actually types. This map is the single highest
 * -value part of the shell: without it, "resume" or "what does he do" returns
 * `command not found` and the visitor concludes the page is broken.
 */
const SYNONYMS: Record<string, string> = {
  // about
  whoami: "about", who: "about", bio: "about", intro: "about", summary: "about",
  me: "about", profile: "about", hi: "about", hello: "about",
  // projects
  project: "projects", portfolio: "projects", work: "projects", works: "projects",
  ls: "projects", dir: "projects", repos: "projects", github: "projects",
  builds: "projects", built: "projects", apps: "projects",
  // experience
  exp: "experience", jobs: "experience", job: "experience", career: "experience",
  history: "experience", employment: "experience", cvhistory: "experience",
  roles: "experience", role: "experience", worked: "experience",
  // skills
  skill: "skills", stack: "skills", tech: "skills", technologies: "skills",
  tools: "skills", knows: "skills", expertise: "skills",
  // certifications
  certs: "certifications", cert: "certifications", certificates: "certifications",
  certificate: "certifications", quals: "certifications", qualifications: "certifications",
  education: "certifications", degree: "certifications", study: "certifications",
  // languages
  language: "languages", speaks: "languages", spoken: "languages", lang: "languages",
  // contact
  email: "contact", mail: "contact", reach: "contact", hire: "contact",
  hiring: "contact", available: "contact", availability: "contact",
  message: "contact", talk: "contact", linkedin: "contact", phone: "contact",
  salary: "contact", rate: "contact", freelance: "contact",
  // cv
  resume: "cv", "résumé": "cv", pdf: "cv", download: "cv", curriculum: "cv",
  // find
  search: "find", grep: "find", lookup: "find",
  // help
  "?": "help", commands: "help", man: "help", usage: "help",
  // clear
  cls: "clear", reset: "clear",
};

const levenshtein = (a: string, b: string) => {
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i += 1) {
    const cur = [i];
    for (let j = 1; j <= n; j += 1) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    prev = cur;
  }
  return prev[n];
};

/**
 * Never return "command not found" without a way forward. Tries, in order:
 * the synonym table, then a fuzzy match, then any command name mentioned
 * anywhere in the input (so "what projects has he built" resolves).
 */
export const suggest = (raw: string): string[] => {
  const words = raw.toLowerCase().split(/[^a-z0-9?éü]+/).filter(Boolean);
  const hits = new Set<string>();

  for (const word of words) {
    const mapped = SYNONYMS[word];
    if (mapped) hits.add(mapped);
    if ((COMMANDS as readonly string[]).includes(word)) hits.add(word);
  }
  if (hits.size) return Array.from(hits).slice(0, 3);

  const first = words[0] ?? "";
  const near = (COMMANDS as readonly string[])
    .map((c) => ({ c, d: levenshtein(first, c) }))
    .filter(({ c, d }) => d <= Math.max(2, Math.floor(c.length / 3)))
    .sort((a, b) => a.d - b.d)
    .map(({ c }) => c);
  if (near.length) return near.slice(0, 3);

  return ["about", "projects", "contact"];
};

/** `about` — the 20-second answer, and what the auto-demo prints on load. */
const aboutLines = (ctx: CommandContext): Line[] => [
  t(ctx.copy.headers.about, "head"),
  t(ctx.data.about.intro),
  blank(),
  t(ctx.data.about.currentWork),
  blank(),
  seg([
    { text: `  ${ctx.copy.labels.based}: ` , },
    { text: ctx.data.about.based },
    { text: `   ${ctx.copy.labels.since}: ` },
    { text: ctx.data.about.since },
  ], "muted"),
];

const projectsLines = (ctx: CommandContext): Line[] => [
  t(ctx.copy.headers.projects, "head"),
  ...ctx.data.projects.map((p) =>
    seg([
      { text: "  " },
      { text: p.title, run: `open ${p.key}` },
      { text: `  — ${p.tech.slice(0, 3).join(", ")}` },
    ])
  ),
  blank(),
  t(ctx.copy.openHint, "muted"),
];

const openLines = (ctx: CommandContext, key: string): Line[] => {
  const p =
    ctx.data.projects.find((x) => x.key.toLowerCase() === key) ??
    ctx.data.projects.find((x) => x.title.toLowerCase().includes(key));
  if (!p) return projectsLines(ctx);

  const links = [
    p.link ? { text: `  ${ctx.copy.labels.link} ${p.link}`, href: p.link } : null,
    p.code ? { text: `  ${ctx.copy.labels.link} ${p.code}`, href: p.code } : null,
  ].filter((v): v is { text: string; href: string } => v !== null);

  return [
    t(p.title, "head"),
    t(p.description),
    ...(p.detail.length ? [blank(), ...p.detail.map((d) => t(d))] : []),
    ...(p.features.length
      ? [blank(), ...p.features.map((f) => t(`  · ${f}`))]
      : []),
    blank(),
    seg([
      { text: `  ${ctx.copy.labels.tech}: ` },
      ...p.tech.flatMap((tech, i) => [
        ...(i ? [{ text: ", " }] : []),
        { text: tech, run: `find ${tech}` },
      ]),
    ], "muted"),
    ...(links.length ? links.map((l) => seg([l])) : []),
    blank(),
    seg([{ text: `  ${ctx.copy.labels.back}`, run: "projects" }], "muted"),
  ];
};

const experienceLines = (ctx: CommandContext, key?: string): Line[] => {
  if (key) {
    const job =
      ctx.data.jobs.find((j) => j.key === key) ??
      ctx.data.jobs.find((j) => j.company.toLowerCase().includes(key));
    if (job) {
      return [
        t(`${job.title} — ${job.company}`, "head"),
        t(`  ${job.dates} · ${job.location}`, "muted"),
        blank(),
        ...job.responsibilities.flatMap((r) => [
          t(`  ${r.title}`),
          t(`    ${r.description}`, "muted"),
        ]),
      ];
    }
  }
  return [
    t(ctx.copy.headers.experience, "head"),
    ...ctx.data.jobs.flatMap((j) => [
      seg([
        { text: "  " },
        { text: `${j.title} — ${j.company}`, run: `experience ${j.key}` },
      ]),
      t(`    ${j.dates} · ${j.location}`, "muted"),
    ]),
    blank(),
    t(ctx.copy.moreHint, "muted"),
  ];
};

const skillsLines = (ctx: CommandContext): Line[] => {
  const groups = [
    ...ctx.data.stack,
    { label: ctx.data.aiLlm.title, items: ctx.data.aiLlm.chips },
    { label: ctx.data.triedOut.title, items: ctx.data.triedOut.chips },
  ];
  return [
    t(ctx.copy.headers.skills, "head"),
    ...groups.flatMap((g) => [
      t(`  ${g.label}`, "muted"),
      seg([
        { text: "    " },
        ...g.items.flatMap((item, i) => [
          ...(i ? [{ text: " · " }] : []),
          { text: item, run: `find ${item}` },
        ]),
      ]),
    ]),
  ];
};

const findLines = (ctx: CommandContext, query: string): Line[] => {
  if (!query) return [t(ctx.copy.findUsage, "muted")];
  const q = query.toLowerCase();
  const out: Line[] = [];

  const projects = ctx.data.projects.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tech.some((x) => x.toLowerCase().includes(q))
  );
  const skills = [
    ...ctx.data.stack.flatMap((g) => g.items),
    ...ctx.data.aiLlm.chips,
    ...ctx.data.triedOut.chips,
  ].filter((x) => x.toLowerCase().includes(q));
  const jobs = ctx.data.jobs.filter(
    (j) =>
      j.company.toLowerCase().includes(q) ||
      j.title.toLowerCase().includes(q) ||
      j.responsibilities.some((r) => r.description.toLowerCase().includes(q))
  );

  if (!projects.length && !skills.length && !jobs.length) {
    return [t(ctx.fmt("findEmpty", { q: query }), "muted")];
  }

  out.push(t(ctx.fmt("findHeader", { q: query }), "head"));
  if (skills.length) {
    out.push(seg([{ text: `  ${ctx.copy.headers.skills}: ` }, { text: skills.join(" · ") }], "muted"));
  }
  projects.forEach((p) =>
    out.push(seg([{ text: "  " }, { text: p.title, run: `open ${p.key}` }, { text: `  — ${p.description.slice(0, 70)}…` }]))
  );
  jobs.forEach((j) =>
    out.push(seg([{ text: "  " }, { text: `${j.title} — ${j.company}`, run: `experience ${j.key}` }]))
  );
  return out;
};

const helpLines = (ctx: CommandContext): Line[] => {
  const rows: [string, string][] = [
    ["about", ctx.copy.help.about],
    ["projects", ctx.copy.help.projects],
    ["experience", ctx.copy.help.experience],
    ["skills", ctx.copy.help.skills],
    ["certifications", ctx.copy.help.certifications],
    ["languages", ctx.copy.help.languages],
    ["contact", ctx.copy.help.contact],
    ["cv", ctx.copy.help.cv],
    ["find <word>", ctx.copy.help.find],
    ["clear", ctx.copy.help.clear],
  ];
  const width = Math.max(...rows.map(([c]) => c.length)) + 2;
  return [
    t(ctx.copy.help.intro, "head"),
    ...rows.map(([cmd, desc]) =>
      seg([
        { text: "  " },
        { text: cmd.padEnd(width), run: cmd.split(" ")[0] },
        { text: desc },
      ])
    ),
  ];
};

export const runCommand = (raw: string, ctx: CommandContext): CommandResult => {
  const trimmed = raw.trim();
  if (!trimmed) return { lines: [] };

  const [head, ...rest] = trimmed.split(/\s+/);
  const arg = rest.join(" ").toLowerCase();
  const cmd = SYNONYMS[head.toLowerCase()] ?? head.toLowerCase();

  switch (cmd) {
    case "about":       return { lines: aboutLines(ctx) };
    case "projects":    return { lines: arg ? openLines(ctx, arg) : projectsLines(ctx) };
    case "open":        return { lines: openLines(ctx, arg) };
    case "experience":  return { lines: experienceLines(ctx, arg || undefined) };
    case "skills":      return { lines: skillsLines(ctx) };
    case "certifications":
      return {
        lines: [
          t(ctx.copy.headers.certifications, "head"),
          ...ctx.data.certifications.map((c) =>
            t(`  ${c.name} — ${c.issuer}${c.date ? ` (${c.date})` : ""}`)
          ),
        ],
      };
    case "languages":
      return {
        lines: [
          t(ctx.copy.headers.languages, "head"),
          ...ctx.data.languages.map((l) => t(`  ${l.name} — ${l.level}`)),
        ],
      };
    case "contact":
      return { lines: [t(ctx.copy.headers.contact, "head")], effect: "contact" };
    case "cv":     return { lines: [t(ctx.copy.cvLine)], effect: "cv" };
    case "find":   return { lines: findLines(ctx, arg) };
    case "help":   return { lines: helpLines(ctx) };
    case "clear":  return { lines: [], effect: "clear" };
    default: {
      const picks = suggest(trimmed);
      return {
        lines: [
          t(ctx.fmt("didYouMean", { cmd: trimmed }), "error"),
          ...picks.map((p) =>
            seg([{ text: "  " }, { text: p, run: p }, { text: `   ${ctx.copy.help[p as keyof typeof ctx.copy.help] ?? ""}` }])
          ),
          blank(),
          t(ctx.copy.orClick, "muted"),
        ],
      };
    }
  }
};

/**
 * Ghost-text completion, fish style. Accepted with ArrowRight, NOT Tab:
 * binding Tab would swallow focus navigation and create a keyboard trap
 * (WCAG 2.1.2, Level A).
 */
export const ghostFor = (value: string): string => {
  const v = value.toLowerCase();
  if (!v || /\s/.test(v)) return "";
  const hit = (COMMANDS as readonly string[]).find((c) => c.startsWith(v) && c !== v);
  return hit ? hit.slice(value.length) : "";
};
