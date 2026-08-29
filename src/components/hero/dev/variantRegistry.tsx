import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { HeroVariantId } from "../types";

/**
 * Reached only through the NODE_ENV gate in Hero.tsx, so none of these five
 * chunks are emitted in a production build.
 *
 * `ssr: true` (the default, stated for emphasis) keeps dev honest against
 * prod: every variant is SSR-complete by contract, so there is no "server
 * renders a skeleton, client renders content" mismatch to debug here.
 */
export const HERO_VARIANT_COMPONENTS: Record<HeroVariantId, ComponentType> = {
  1: dynamic(() => import("../variants/HeroT1").then((m) => m.HeroT1), { ssr: true }),
  2: dynamic(() => import("../variants/HeroT2").then((m) => m.HeroT2), { ssr: true }),
  3: dynamic(() => import("../variants/HeroT3").then((m) => m.HeroT3), { ssr: true }),
  4: dynamic(() => import("../variants/HeroT4").then((m) => m.HeroT4), { ssr: true }),
  5: dynamic(() => import("../variants/HeroT5").then((m) => m.HeroT5), { ssr: true }),
};
