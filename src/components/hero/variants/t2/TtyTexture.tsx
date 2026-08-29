/**
 * The only decoration in T2: a static scanline field over the whole hero.
 *
 * STATIC on purpose. Animated CRT effects — flicker, rolling bars, jitter —
 * are one of the most-reported accessibility complaints about terminal sites,
 * so there is no animation here at all and therefore nothing to gate behind
 * `canAnimate`. At ~2% alpha on a 4px pitch it reads as surface texture rather
 * than as an effect, and it never lands on top of anything: it is painted
 * beneath the hero's content, and it is `pointer-events-none` so the "click
 * anywhere to focus the prompt" behaviour of the scrollback still works.
 *
 * It covers the readable band as well as the terminal. That is deliberate —
 * the point of this variant is that the terminal is not an app sitting on the
 * page, so a texture that stopped at the terminal's edge would draw exactly
 * the window frame the variant is trying not to have.
 */
export const TtyTexture = ({ className = "" }: { className?: string }) => (
  <div
    aria-hidden
    className={`pointer-events-none absolute inset-0 ${className}`}
    style={{
      backgroundImage:
        "repeating-linear-gradient(to bottom, rgba(228,228,231,0.022) 0px, rgba(228,228,231,0.022) 1px, rgba(228,228,231,0) 1px, rgba(228,228,231,0) 4px)",
    }}
  />
);
