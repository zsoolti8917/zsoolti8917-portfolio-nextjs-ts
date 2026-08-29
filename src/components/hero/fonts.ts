import { Recursive } from "next/font/google";

/**
 * Imported by the Shell variant only — never by _app.tsx — so the file is
 * requested exclusively when that variant is the one on screen. If V4 doesn't
 * win, this font never ships.
 *
 * `MONO` is the axis that matters: Recursive interpolates between a
 * proportional sans and a true monospace, which is what makes a terminal read
 * as typeset rather than as a <pre>. `latin-ext` is required for the Slovak
 * and Hungarian copy.
 */
export const recursiveMono = Recursive({
  subsets: ["latin", "latin-ext"],
  axes: ["MONO"],
  display: "swap",
  preload: false,
  variable: "--font-recursive",
});
