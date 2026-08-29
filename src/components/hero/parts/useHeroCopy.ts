import { useTranslations } from "next-intl";
import type {
  HeroCommonCopy, HeroTerminalCopy, HeroVariantCopy, HeroVariantId,
} from "../types";

/** Typed reader for `hero.common`, `hero.terminal` and one variant's framing copy. */
export const useHeroCopy = (variant: HeroVariantId) => {
  const t = useTranslations("hero");
  return {
    common: t.raw("common") as HeroCommonCopy,
    terminal: t.raw("terminal") as HeroTerminalCopy,
    copy: t.raw(`t${variant}`) as HeroVariantCopy,
  };
};
