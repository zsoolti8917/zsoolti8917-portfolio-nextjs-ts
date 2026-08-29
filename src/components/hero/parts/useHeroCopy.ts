import { useTranslations } from "next-intl";
import type { HeroCommonCopy, HeroCopyMap, HeroVariantId } from "../types";

/**
 * Typed reader for `hero.common.*` plus one variant's namespace, so the
 * string literals live in one file instead of five.
 */
export const useHeroCopy = <N extends HeroVariantId>(variant: N) => {
  const t = useTranslations("hero");

  return {
    common: t.raw("common") as HeroCommonCopy,
    copy: t.raw(`v${variant}`) as HeroCopyMap[N],
  };
};
