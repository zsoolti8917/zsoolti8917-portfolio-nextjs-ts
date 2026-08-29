import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { PROJECTS } from "@/components/projects/Projects";
import type { StackGroup, Certification, LanguageEntry, ChipGroup } from "@/components/about/types";

export interface TerminalProject {
  /** i18n key — also the argument the visitor types: `open coffece`. */
  key: string;
  title: string;
  tech: string[];
  description: string;
  detail: string[];
  features: string[];
  link?: string;
  code?: string;
}

export interface TerminalJob {
  key: string;
  company: string;
  title: string;
  dates: string;
  location: string;
  responsibilities: { title: string; description: string }[];
}

export interface TerminalData {
  projects: TerminalProject[];
  jobs: TerminalJob[];
  stack: StackGroup[];
  aiLlm: ChipGroup;
  triedOut: ChipGroup;
  certifications: Certification[];
  languages: LanguageEntry[];
  about: { intro: string; currentWork: string; based: string; from: string; since: string };
}

/** A slug a visitor could plausibly type, from a company name. */
const slug = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").split("-")[0];

/**
 * Single read point for everything the shell can print. Every field comes from
 * the SAME next-intl namespaces the visible sections render, so the terminal
 * cannot drift from the page — and nothing it says exists only here.
 */
export const useTerminalData = (): TerminalData => {
  const p = useTranslations("projects");
  const s = useTranslations("Stats");
  const e = useTranslations("experience");
  const a = useTranslations("About");

  // Memoized on the four readers, which next-intl keeps stable for a locale.
  // Unmemoized, every render built a fresh object, `useTerminal`'s `ctx`,
  // `initialBlocks` and `run` changed identity with it, and the bus `register`
  // effect tore itself down and re-subscribed on every keystroke.
  return useMemo(() => {
    const projects: TerminalProject[] = PROJECTS.map((def) => {
      const modal = p.raw(`${def.key}.modalContent`) as Record<string, string> | undefined;
      const paras = ["para1", "para2", "para3", "para4", "para5"]
        .map((k) => modal?.[k])
        .filter((v): v is string => Boolean(v));
      return {
        key: def.key,
        title: p(`${def.key}.title`),
        tech: p(`${def.key}.tech`).split(",").map((v) => v.trim()).filter(Boolean),
        description: p(`${def.key}.description`),
        detail: paras,
        features: (modal?.featuresList ?? "").split("|").map((v) => v.trim()).filter(Boolean),
        link: def.projectLink,
        code: def.code,
      };
    });

    const jobs = (e.raw("jobs") as TerminalJob[]).map((job: any) => ({
      key: slug(job.companyName),
      company: job.companyName,
      title: job.jobTitle,
      dates: job.dates,
      location: job.location,
      responsibilities: job.responsibilities ?? [],
    }));

    return {
      projects,
      jobs,
      stack: s.raw("stack") as StackGroup[],
      aiLlm: s.raw("aiLlm") as ChipGroup,
      triedOut: s.raw("triedOut") as ChipGroup,
      certifications: s.raw("certifications") as Certification[],
      languages: s.raw("languages") as LanguageEntry[],
      about: {
        intro: `${a("firstLetter")}${a("intro")}`,
        currentWork: a("currentWork"),
        based: a("facts.basedValue"),
        from: a("facts.fromValue"),
        since: a("facts.sinceValue"),
      },
    };
  }, [a, e, p, s]);
};
