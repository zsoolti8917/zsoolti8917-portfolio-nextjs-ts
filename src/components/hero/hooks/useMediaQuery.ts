import { useCallback, useSyncExternalStore } from "react";

/**
 * SSR-safe media query. `getServerSnapshot` returns false, so the server and
 * the first client render provably agree — which is what lets capability
 * values gate effects without risking a hydration mismatch.
 */
export const useMediaQuery = (query: string) => {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query]
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  );
};
