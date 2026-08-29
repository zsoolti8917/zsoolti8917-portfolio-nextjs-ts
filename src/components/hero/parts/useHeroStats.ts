import { useTranslations } from "next-intl";
import { PROJECTS } from "@/components/projects/Projects";
import type {
  Certification,
  ChipGroup,
  LanguageEntry,
  StackGroup,
} from "@/components/about/types";
import type { HeroStats } from "../types";

/**
 * Must agree with `About.facts.sinceValue`, which is the same fact as *copy*.
 * Deliberately not parsed out of that string — it is a translation, and
 * parseInt on translated text is a bug waiting for a locale that writes it
 * differently.
 */
export const CAREER_START_YEAR = 2022;

/**
 * Single read point for everything the hero counts, mirroring `useAboutData`.
 * Every number here is a count of something already rendered elsewhere on the
 * page, so the hero cannot drift from the site or overstate anything.
 */
export const useHeroStats = (): HeroStats => {
  const t = useTranslations("Stats");

  const stack = t.raw("stack") as StackGroup[];
  const aiLlm = t.raw("aiLlm") as ChipGroup;
  const certifications = t.raw("certifications") as Certification[];
  const languages = t.raw("languages") as LanguageEntry[];

  const flatStack = stack.flatMap((group) => group.items);
  const buildDate = (process.env.NEXT_PUBLIC_BUILD_TIME ?? "").slice(0, 10);
  const buildYear = Number(buildDate.slice(0, 4)) || CAREER_START_YEAR;

  return {
    stack,
    flatStack,
    toolCount: flatStack.length,
    aiCount: aiLlm.chips.length,
    projectCount: PROJECTS.length,
    certCount: certifications.length,
    langCount: languages.length,
    years: Math.max(1, buildYear - CAREER_START_YEAR),
    buildDate,
  };
};
