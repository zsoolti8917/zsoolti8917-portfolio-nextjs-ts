/** Copy that is shared by the card and anything else naming the person. */
export interface HeroCommonCopy {
  name: string;
  role: string;
  tagline: string;
  location: string;
}

/** The labels and values of the `whoami` card. */
export interface HeroWhoamiCopy {
  headline: string;
  /** Row labels. */
  role: string;
  now: string;
  based: string;
  since: string;
  stack: string;
  statusLabel: string;
  /** Row values that exist nowhere else. `based` reuses `common.location`,
   *  `since` comes from the About data, `stack` from the Stats data. */
  roleValue: string;
  nowValue: string;
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
  ghostHint: string;
  didYouMean: string;
  orClick: string;
  openHint: string;
  moreHint: string;
  cvLine: string;
  findHeader: string;
  findEmpty: string;
  findUsage: string;
  /** The availability line, in the card and the status bar. Softening or
   *  emptying this is a JSON edit, not a code edit. */
  status: string;
  statusBar: { cwd: string; hints: string; zone: string };
  whoami: HeroWhoamiCopy;
  help: Record<
    | "intro" | "help" | "whoami" | "about" | "projects" | "experience" | "skills"
    | "certifications" | "languages" | "contact" | "cv" | "find" | "clear",
    string
  >;
  headers: Record<
    "about" | "projects" | "experience" | "skills" | "certifications" | "languages" | "contact",
    string
  >;
  labels: Record<"tech" | "link" | "based" | "from" | "since" | "back", string>;
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
