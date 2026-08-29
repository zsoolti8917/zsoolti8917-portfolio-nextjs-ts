/**
 * The single line that decides which hero the world sees.
 *
 * A STATIC import on purpose: it keeps the <h1> and the terminal's first
 * output block server-rendered, so the page is legible to a recruiter on first
 * paint and complete to a crawler that never runs JavaScript.
 */
export { HeroT1 as ShippedHero } from "./HeroT1";

/** Re-exported for the dev switcher's "(ships)" badge. */
export { SHIPPED_VARIANT_ID } from "../shippedId";
