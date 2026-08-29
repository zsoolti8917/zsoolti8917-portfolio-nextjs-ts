import { useTranslations } from "next-intl";
import type { HeroCommonCopy, HeroFramingCopy, HeroTerminalCopy } from "../types";

/** Typed reader for the three groups of hero copy. */
export const useHeroCopy = () => {
  const t = useTranslations("hero");
  return {
    common: t.raw("common") as HeroCommonCopy,
    terminal: t.raw("terminal") as HeroTerminalCopy,
    copy: { eyebrow: t("eyebrow"), headline: t("headline") } as HeroFramingCopy,
  };
};
