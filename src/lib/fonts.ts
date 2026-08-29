import { Inter, Recursive } from "next/font/google";

/**
 * Both fonts are loaded globally from `_app.tsx` — the hero, the nav kickers
 * and the section headers all depend on them, so there is nothing left to
 * lazy-load and `preload` avoids a visible swap on the first screen.
 *
 * `latin-ext` is required: the Slovak and Hungarian copy is full of diacritics
 * that plain `latin` does not cover.
 */
export const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  preload: true,
  variable: "--font-inter",
});

/**
 * `MONO` is the axis that matters: Recursive interpolates between a
 * proportional sans and a true monospace, which is what makes the terminal
 * read as typeset rather than as a <pre>. Pin it with `.mono-1`.
 *
 * Do NOT add `weight` — this is a variable font, wght 300..1000 ships with it,
 * and passing a weight alongside `axes` makes next/font throw at build time.
 */
export const recursive = Recursive({
  subsets: ["latin", "latin-ext"],
  axes: ["MONO"],
  display: "swap",
  preload: true,
  variable: "--font-recursive",
});
