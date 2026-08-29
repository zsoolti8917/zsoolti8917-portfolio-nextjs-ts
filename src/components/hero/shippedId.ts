import type { HeroVariantId } from "./types";

/**
 * Which hero the world sees. Kept in its own module — with no component
 * imports — so `getStaticProps` can read it without pulling any React
 * component into the data path.
 *
 * Change this AND the re-export in `variants/shipped.ts` together.
 */
export const SHIPPED_VARIANT_ID: HeroVariantId = 1;

export const ALL_HERO_VARIANT_IDS: HeroVariantId[] = [1, 2, 3, 4, 5];
