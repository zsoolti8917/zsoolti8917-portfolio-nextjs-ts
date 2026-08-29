import { RefObject, useEffect, useState } from "react";

/**
 * True only while the element is on screen AND the tab is visible. Every hero
 * loop hangs off this so nothing burns battery in a background tab.
 */
export const useInViewActive = (ref: RefObject<Element>) => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let onScreen = false;
    const sync = () => setActive(onScreen && !document.hidden);

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { threshold: 0 }
    );
    io.observe(el);
    document.addEventListener("visibilitychange", sync);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [ref]);

  return active;
};
