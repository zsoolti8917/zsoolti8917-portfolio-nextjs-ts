export type HeroVariantId = 1 | 2 | 3 | 4 | 5;

/** Copy that must NOT change when the variant changes. */
export interface HeroCommonCopy {
  name: string;
  languages: string;
  ctaWork: string;
  ctaCv: string;
  ctaContact: string;
  statusLabel: string;
  statusValue: string;
  proof: {
    tools: string;
    projects: string;
    certs: string;
    langs: string;
    years: string;
    build: string;
  };
}

export interface HeroV1Copy {
  eyebrow: string;
  headlineLines: string[];
  subhead: string;
  panelTitle: string;
}

export interface HeroV2Copy {
  eyebrow: string;
  headlineLines: string[];
  subhead: string;
  hint: string;
  resetLabel: string;
}

export interface HeroV3Copy {
  eyebrow: string;
  headline: string;
  subhead: string;
}

export interface HeroV4Copy {
  eyebrow: string;
  headline: string;
  subhead: string;
  prompt: string;
  boot: string[];
  hint: string;
  notFound: string;
  help: {
    intro: string;
    whoami: string;
    ls: string;
    stack: string;
    cv: string;
    contact: string;
    gui: string;
  };
  whoami: string[];
  contactLines: string[];
  cvLine: string;
  stackHeader: string;
  lsHeader: string;
  guiLeaving: string;
}

export interface HeroV5Copy {
  eyebrow: string;
  headlineLines: string[];
  subhead: string;
  hoverHint: string;
}

export interface HeroCopyMap {
  1: HeroV1Copy;
  2: HeroV2Copy;
  3: HeroV3Copy;
  4: HeroV4Copy;
  5: HeroV5Copy;
}

export interface HeroStats {
  /** Stack groups exactly as `Stats.stack` defines them. */
  stack: { label: string; items: string[] }[];
  /** Every stack item in one list, for variants that want a flat pile. */
  flatStack: string[];
  toolCount: number;
  aiCount: number;
  projectCount: number;
  certCount: number;
  langCount: number;
  years: number;
  /** ISO date, already sliced to YYYY-MM-DD. Never locale-formatted. */
  buildDate: string;
}
