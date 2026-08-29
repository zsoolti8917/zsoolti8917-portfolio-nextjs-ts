import { useEffect, useSyncExternalStore } from "react";

/**
 * "Is a full-screen overlay open?", readable from outside the React tree that
 * owns the overlay.
 *
 * `ScrollToTopButton` is mounted in `_app`, i.e. above `TerminalBusProvider`,
 * so it cannot consume the bus — but it is `position: fixed` and would sit in
 * the palette's blurred backdrop, tabbable, while a dialog is open. A
 * module-level store is the smallest thing that lets it step aside.
 */
let count = 0;
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/** Counts, rather than flags: the palette can open on top of a project modal. */
export const useOverlay = (active: boolean) => {
  useEffect(() => {
    if (!active) return;

    count += 1;
    listeners.forEach((listener) => listener());

    return () => {
      count -= 1;
      listeners.forEach((listener) => listener());
    };
  }, [active]);
};

export const useOverlayOpen = () =>
  // The server snapshot is `false`: nothing is open before hydration.
  useSyncExternalStore(
    subscribe,
    () => count > 0,
    () => false
  );
