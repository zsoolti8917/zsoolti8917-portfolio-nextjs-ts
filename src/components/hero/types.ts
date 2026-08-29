export type HeroVariantId = 1 | 2 | 3 | 4 | 5;

/** Copy that must NOT change when the variant changes. */
export interface HeroCommonCopy {
  name: string;
  role: string;
  tagline: string;
  location: string;
  ctaWork: string;
  ctaCv: string;
  ctaContact: string;
  statusLabel: string;
  statusValue: string;
}

export interface HeroTerminalCopy {
  prompt: string;
  windowTitle: string;
  readAsPage: string;
  skipLink: string;
  inputLabel: string;
  searchPlaceholder: string;
  logLabel: string;
  hintClick: string;
  ready: string;
  ghostHint: string;
  didYouMean: string;
  orClick: string;
  openHint: string;
  moreHint: string;
  cvLine: string;
  findHeader: string;
  findEmpty: string;
  findUsage: string;
  boot: string[];
  help: Record<
    | "intro" | "help" | "about" | "projects" | "experience" | "skills"
    | "certifications" | "languages" | "contact" | "cv" | "find" | "clear",
    string
  >;
  headers: Record<
    "about" | "projects" | "experience" | "skills" | "certifications" | "languages" | "contact",
    string
  >;
  labels: Record<"tech" | "link" | "based" | "from" | "since" | "back", string>;
}

export interface HeroVariantCopy {
  eyebrow: string;
  headline: string;
}

export interface HeroStats {
  stack: { label: string; items: string[] }[];
  flatStack: string[];
  toolCount: number;
  aiCount: number;
  projectCount: number;
  certCount: number;
  langCount: number;
  years: number;
  buildDate: string;
}
