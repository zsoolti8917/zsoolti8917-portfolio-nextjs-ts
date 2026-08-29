/**
 * Pure split + weight model for the Kinetic headline.
 *
 * Lives apart from the component and the loop so that BOTH sides read the same
 * source of truth: the renderer walks `lines` to emit the spans, the loop reads
 * `bases` as a flat array in DOM order. Nothing has to carry a global index
 * through the JSX, and the two can never disagree about how many letters exist.
 */

/** Heaviest instance any letter reaches under the cursor. */
export const WEIGHT_MAX = 900;

/**
 * Static weight gradient down the lines — light claim, heavier payoff. This is
 * ALSO each letter's rest weight under the effect, which is the point: the
 * server-rendered type and the effect's idle state are the same thing, so the
 * upgrade never announces itself with a pop, and the advance widths measured at
 * rest are exactly the widths the type actually has when nothing is happening.
 */
export const BASE_WEIGHT_FIRST = 300;
export const BASE_WEIGHT_LAST = 520;

export interface KineticLine {
  /** Words, each already split into letters. Word grouping is load-bearing. */
  words: string[][];
  base: number;
}

export interface KineticSplit {
  lines: KineticLine[];
  /** One entry per letter span, in document order. */
  bases: Uint16Array;
}

export const splitHeadline = (lines: string[]): KineticSplit => {
  const span = Math.max(1, lines.length - 1);
  const bases: number[] = [];

  const out = lines.map((line, i) => {
    const base = Math.round(
      BASE_WEIGHT_FIRST + ((BASE_WEIGHT_LAST - BASE_WEIGHT_FIRST) * i) / span
    );
    // `Array.from` and not `split("")`: the Hungarian and Slovak headlines are
    // NFC, but a code-unit split would still be a latent surrogate-pair bug.
    const words = line
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => Array.from(word));

    for (const word of words) for (let k = 0; k < word.length; k++) bases.push(base);
    return { words, base };
  });

  return { lines: out, bases: Uint16Array.from(bases) };
};

/**
 * `font-variation-settings` overrides `font-weight` for the wght axis, so this
 * class is invisible once Inter has loaded. It matters during the swap: without
 * it the fallback face renders the whole headline at one weight and the
 * gradient only appears when the webfont lands.
 *
 * Written as whole literals so Tailwind's content scanner can see them.
 */
export const fallbackWeightClass = (base: number) =>
  base < 360
    ? "font-light"
    : base < 470
      ? "font-normal"
      : base < 580
        ? "font-medium"
        : "font-semibold";
