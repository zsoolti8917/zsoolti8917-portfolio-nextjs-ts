import { useTranslations } from "next-intl";
import type { HeroCommonCopy, HeroTerminalCopy } from "../types";

/** Typed reader for the two groups of hero copy. */
export const useHeroCopy = () => {
  const t = useTranslations("hero");
  return {
    common: t.raw("common") as HeroCommonCopy,
    terminal: t.raw("terminal") as HeroTerminalCopy,
  };
};
