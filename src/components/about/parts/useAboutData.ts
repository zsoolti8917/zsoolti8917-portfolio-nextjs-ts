import { useTranslations } from "next-intl";
import type {
  Certification,
  ChipGroup,
  LanguageEntry,
  StackGroup,
} from "../types";

/**
 * Single read point for the restructured `Stats` namespace. The certification
 * and language shapes mirror `cv/content.<locale>.json` so the site and the CV
 * cannot drift apart.
 */
export const useAboutData = () => {
  const t = useTranslations("Stats");

  return {
    stack: t.raw("stack") as StackGroup[],
    aiLlm: t.raw("aiLlm") as ChipGroup,
    triedOut: t.raw("triedOut") as ChipGroup,
    certifications: t.raw("certifications") as Certification[],
    languages: t.raw("languages") as LanguageEntry[],
  };
};
