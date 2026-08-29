/**
 * The single line that decides which hero the world sees.
 *
 * This is a STATIC import on purpose: it keeps the <h1> server-rendered, so
 * LCP stays a text node in the initial HTML. Each variant's heavy runtime
 * (matter-js, WebGL) is lazy *inside* the variant, which is what makes it safe
 * to promote any of the five here without dragging an engine into the entry
 * chunk.
 */
export { HeroV1 as ShippedHero } from "./HeroV1";

/** Re-exported for the dev switcher's "(ships)" badge. */
export { SHIPPED_VARIANT_ID } from "../shippedId";
