import { useEffect, useState } from "react";

/** What the status bar shows before the clock is known. */
export const CLOCK_PLACEHOLDER = "--:--";

/**
 * Prague wall-clock time, HH:MM.
 *
 * The server has no idea what minute it will be when the page is served from
 * the CDN, so it renders the placeholder and so does the first client paint —
 * the markup provably agrees, and no `suppressHydrationWarning` is needed to
 * paper over a mismatch. `Date` is read in an effect only, never during render.
 *
 * The interval is minute-ALIGNED rather than a flat 60 s: a fixed interval
 * started at :47 would keep updating at :47 of every minute and the displayed
 * minute would lag the real one by up to 59 seconds.
 */
export const usePragueClock = () => {
  const [time, setTime] = useState(CLOCK_PLACEHOLDER);

  useEffect(() => {
    const format = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Prague",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const now = Date.now();
      setTime(format.format(now));
      timer = setTimeout(tick, 60_000 - (now % 60_000));
    };
    tick();

    return () => clearTimeout(timer);
  }, []);

  return time;
};
