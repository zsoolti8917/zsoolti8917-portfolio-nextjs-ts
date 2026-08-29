import { useEffect, useState } from "react";

/**
 * Returns the id of the section currently under the reading line.
 *
 * `rootMargin` shrinks the viewport to a thin horizontal band (40% from the
 * top, 55% from the bottom) and `threshold: 0` fires as soon as any part of a
 * section crosses it. The old sidebar used `threshold: 0.3` against the whole
 * viewport, which never fired for the Projects section on a 390px phone — the
 * section is far taller than the screen, so 30% of it is never visible.
 */
export const useScrollSpy = (ids: string[]) => {
  const [active, setActive] = useState("");
  // Depend on the contents, not the array identity: call sites build the list
  // inline from translations and would otherwise re-observe on every render.
  const key = ids.join(",");

  useEffect(() => {
    const elements = key
      .split(",")
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [key]);

  return active;
};
