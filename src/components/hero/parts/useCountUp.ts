import { RefObject, useEffect } from "react";
import { cancelFrame, frame } from "framer-motion";

/**
 * Eases a number up from zero by writing textContent through a ref.
 *
 * The server renders the FINAL value, so a visitor without JS (or with
 * reduced motion) sees the real number and React never observes the reset —
 * which is what keeps this out of the hydration-mismatch category.
 */
export const useCountUp = (
  ref: RefObject<HTMLElement>,
  value: number,
  { enabled = true, durationMs = 900, delayMs = 0 } = {}
) => {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    el.textContent = "0";
    const start = performance.now() + delayMs;

    const tick = () => {
      const now = performance.now();
      if (now < start) return;
      const t = Math.min(1, (now - start) / durationMs);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(value * eased));
      if (t >= 1) cancelFrame(tick);
    };

    frame.render(tick, true);
    return () => {
      cancelFrame(tick);
      el.textContent = String(value);
    };
  }, [ref, value, enabled, durationMs, delayMs]);
};
