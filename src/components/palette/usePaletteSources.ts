import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { COMMANDS } from "../hero/terminal/commands";
import type { Job } from "../experience/ExperienceItem";
import { PROJECTS } from "../projects/Projects";
import type { PaletteSources } from "./search";

/** The four scroll targets, in page order. Same ids `TopNav` links to. */
export const SECTION_IDS = ["about", "projects", "experience", "contact"] as const;

/** Same three as `nav/LocaleMenu`. */
const LOCALES = ["en", "sk", "hu"] as const;

/**
 * A slug a visitor could plausibly type, from a company name.
 * Duplicated from `hero/terminal/useTerminalData` (three lines, not exported
 * there); the two must agree, since both address the same job.
 */
const slug = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").split("-")[0];

/**
 * Everything the palette can offer, read from the same next-intl namespaces the
 * page itself renders — so a row can never name something the site does not
 * say. `search.ts` stays pure by receiving all of it as data.
 */
export const usePaletteSources = (): { sources: PaletteSources; email: string } => {
  const nav = useTranslations("nav");
  const p = useTranslations("projects");
  const e = useTranslations("experience");
  const c = useTranslations("Contact");
  const palette = useTranslations("palette");
  const languages = useTranslations("header.languages");

  const email = c("email");

  const sources = useMemo<PaletteSources>(
    () => ({
      sections: SECTION_IDS.map((id) => ({ id, label: nav(id) })),
      projects: PROJECTS.map((def) => ({
        key: def.key,
        title: p(`${def.key}.title`),
        tech: p(`${def.key}.tech`).split(",").map((v) => v.trim()).filter(Boolean),
      })),
      jobs: (e.raw("jobs") as Job[]).map((job) => ({
        key: slug(job.companyName),
        label: `${job.jobTitle} — ${job.companyName}`,
      })),
      // The whole announced command set, so a command added to the terminal
      // shows up here with no change on this side.
      commands: COMMANDS,
      actions: [
        {
          id: "cv",
          label: palette("actions.cv"),
          keywords: ["cv", "resume", "pdf", "download"],
        },
        {
          id: "copyEmail",
          label: palette("actions.copyEmail"),
          keywords: ["email", "mail", "copy", email],
        },
      ],
      locales: LOCALES.map((code) => ({ code, label: languages(code) })),
    }),
    [nav, p, e, palette, languages, email]
  );

  return { sources, email };
};
