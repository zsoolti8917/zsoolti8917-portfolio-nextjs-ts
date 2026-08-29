import { useEffect, useRef, useState } from "react";

/**
 * Returns the id of the section currently under the reading line.
 *
 * `rootMargin` shrinks the viewport to a thin horizontal band (40% from the
 * top, 55% from the bottom) and `threshold: 0` fires as soon as any part of a
 * section crosses it. The old sidebar used `threshold: 0.3` against the whole
 * viewport, which never fired for the Projects section on a 390px phone — the
 * section is far taller than the screen, so 30% of it is never visible.
 *
 * Every currently-intersecting id is tracked in a Set (ref, so entries survive
 * across callbacks); the active id is the first one in `ids` order found in
 * that set, or "" once the user has scrolled back up past all of them — an
 * empty set must not leave the previous section highlighted.
 */
export const useScrollSpy = (ids: string[]) => {
  const [active, setActive] = useState("");
  // Depend on the contents, not the array identity: call sites build the list
  // inline from translations and would otherwise re-observe on every render.
  const key = ids.join(",");
  const intersecting = useRef<Set<string>>(new Set());

  useEffect(() => {
    const orderedIds = key.split(",");
    const elements = orderedIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    intersecting.current = new Set();

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            intersecting.current.add(entry.target.id);
          } else {
            intersecting.current.delete(entry.target.id);
          }
        });
        const next = orderedIds.find((id) => intersecting.current.has(id)) ?? "";
        setActive(next);
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [key]);

  return active;
};
