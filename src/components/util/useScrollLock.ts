import { useEffect } from "react";

// Module-level, deliberately: the palette can open on top of a project modal,
// and two independent components each restoring "their" value would unlock the
// page while the other is still open.
let locks = 0;
let previousOverflow = "";

/**
 * Freezes background scrolling while `active`.
 *
 * Restores whatever `overflow` was there before rather than assuming "scroll" —
 * the old modal hard-coded `overflowY = "scroll"` on close, which left every
 * page with a permanent scrollbar gutter after the first modal view.
 */
export const useScrollLock = (active: boolean) => {
  useEffect(() => {
    if (!active) return;

    const { style } = document.body;
    if (locks === 0) {
      previousOverflow = style.overflow;
      style.overflow = "hidden";
    }
    locks += 1;

    return () => {
      locks -= 1;
      if (locks === 0) style.overflow = previousOverflow;
    };
  }, [active]);
};
