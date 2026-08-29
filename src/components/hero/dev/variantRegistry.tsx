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
  1: dynamic(() => import("../variants/HeroV1").then((m) => m.HeroV1), { ssr: true }),
  2: dynamic(() => import("../variants/HeroV2").then((m) => m.HeroV2), { ssr: true }),
  3: dynamic(() => import("../variants/HeroV3").then((m) => m.HeroV3), { ssr: true }),
  4: dynamic(() => import("../variants/HeroV4").then((m) => m.HeroV4), { ssr: true }),
  5: dynamic(() => import("../variants/HeroV5").then((m) => m.HeroV5), { ssr: true }),
};
