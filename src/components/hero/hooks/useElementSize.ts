import { RefObject, useEffect, useState } from "react";

/**
 * Debounced ResizeObserver. Height-only changes are ignored by default:
 * mobile browser chrome showing/hiding fires resize constantly, and a hero
 * that rebuilds its physics world or GL viewport on every one of those is
 * unusable on a phone.
 */
export const useElementSize = (
  ref: RefObject<Element>,
  { debounceMs = 150, widthOnly = true } = {}
) => {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let timer: ReturnType<typeof setTimeout>;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      clearTimeout(timer);
      timer = setTimeout(() => {
        setSize((prev) => {
          if (prev.width === width && (widthOnly || prev.height === height)) {
            return prev;
          }
          if (widthOnly && prev.width === width) return prev;
          return { width, height };
        });
      }, debounceMs);
    });

    ro.observe(el);
    return () => {
      clearTimeout(timer);
      ro.disconnect();
    };
  }, [ref, debounceMs, widthOnly]);

  return size;
};
