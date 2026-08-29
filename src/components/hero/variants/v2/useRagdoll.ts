import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { cancelFrame, frame } from "framer-motion";
import { useElementSize } from "../../hooks/useElementSize";
import { createRagdollWorld, type ChipTarget } from "./ragdollWorld";

/** Marks the chips the world is allowed to drive. Queried once, in the effect. */
export const CHIP_ATTR = "data-hero-chip";

/** Matches `.hero-chip-physics` in globals.css. Added only once a world exists. */
const PHYSICS_CLASS = "hero-chip-physics";

/** Floor for the pile area, in case the container measures shorter than the CSS min. */
const MIN_HEIGHT = 240;

interface Controls {
  start: () => void;
  stop: () => void;
  resize: (width: number) => void;
  reset: () => void;
}

interface Options {
  /** The pile area. Owned by the caller so it can also feed `useInViewActive`. */
  containerRef: RefObject<HTMLElement>;
  /** `canRunPhysics`. Read here only, never in JSX. */
  enabled: boolean;
  /** On screen and tab visible. */
  active: boolean;
}

/**
 * Turns the static, server-rendered chip list into a matter-js pile — in place.
 * The same `<span>` elements are repositioned; nothing is re-rendered as
 * different markup, so the SSR output is also the reduced-motion, no-JS and
 * mobile form and this hook is a pure upgrade on top of it.
 */
export const useRagdoll = ({ containerRef, enabled, active }: Options) => {
  const controlsRef = useRef<Controls | null>(null);
  const activeRef = useRef(active);
  const [live, setLive] = useState(false);

  const { width } = useElementSize(containerRef);
  const hasWidth = width > 0;

  // Declared before the build effect so `activeRef` is current by the time the
  // async import resolves and the world asks whether it should be running.
  useEffect(() => {
    activeRef.current = active;
    if (active) controlsRef.current?.start();
    else controlsRef.current?.stop();
  }, [active]);

  useEffect(() => {
    if (!enabled || !hasWidth) return;
    const container = containerRef.current;
    if (!container) return;

    const els = Array.from(
      container.querySelectorAll<HTMLElement>(`[${CHIP_ATTR}]`)
    );
    if (els.length === 0) return;

    let disposed = false;
    let matter: typeof import("matter-js") | null = null;
    let commit: (() => void) | undefined;
    let teardown: (() => void) | undefined;

    /**
     * READ pass. Every chip's box is measured here in one batch, before a
     * single physics step; nothing reads layout again for the life of the
     * world. Building the engine is pure JS, so it belongs here too — only the
     * DOM writes are deferred to the render pass below.
     */
    const measure = () => {
      if (disposed || !matter) return;

      const chips: ChipTarget[] = els.map((el) => ({
        el,
        width: el.offsetWidth,
        height: el.offsetHeight,
      }));
      const boxWidth = container.clientWidth;
      const boxHeight = Math.max(container.clientHeight, MIN_HEIGHT);
      if (boxWidth <= 0) return;

      const world = createRagdollWorld(matter, {
        container,
        chips,
        width: boxWidth,
        height: boxHeight,
      });

      let armed = false;

      const step = (data: { timestamp: number }) => world.step(data.timestamp);
      const sync = () => {
        world.sync();
        // Sleep and stop: once every body is asleep the loop cancels itself and
        // the pile costs nothing at all. `start` re-arms it.
        if (world.settled()) stop();
      };

      const start = () => {
        if (armed || disposed) return;
        armed = true;
        frame.update(step, true);
        frame.render(sync, true);
      };
      function stop() {
        if (!armed) return;
        armed = false;
        cancelFrame(step);
        cancelFrame(sync);
      }

      const onPointerDown = () => start();
      const onWindowMouseUp = () => world.release();

      /** WRITE pass, same frame — nothing paints between the two. */
      commit = () => {
        if (disposed) return;

        // Pin the height the chips were measured against: they are about to
        // leave the flow and the box must not collapse under them.
        container.style.height = `${boxHeight}px`;
        // Spawn transforms go on BEFORE the chips are made absolute, so they
        // never paint stacked at the container's origin.
        world.sync();
        for (const el of els) el.classList.add(PHYSICS_CLASS);

        container.addEventListener("pointerdown", onPointerDown);
        window.addEventListener("mouseup", onWindowMouseUp);

        controlsRef.current = {
          start,
          stop,
          resize: (next) => {
            world.resize(next);
            if (activeRef.current) start();
          },
          reset: () => {
            world.reset();
            if (activeRef.current) start();
          },
        };

        setLive(true);
        if (activeRef.current) start();
      };

      teardown = () => {
        stop();
        container.removeEventListener("pointerdown", onPointerDown);
        window.removeEventListener("mouseup", onWindowMouseUp);
        world.destroy();
        controlsRef.current = null;
        container.style.height = "";
        for (const el of els) {
          el.classList.remove(PHYSICS_CLASS);
          el.style.transform = "";
        }
        setLive(false);
      };

      frame.render(commit);
    };

    // Lazy, and guarded: under StrictMode this resolves after the first run of
    // the effect has already been torn down.
    void import("matter-js").then((mod) => {
      if (disposed) return;
      matter = mod.default;
      frame.read(measure);
    });

    return () => {
      disposed = true;
      cancelFrame(measure);
      if (commit) cancelFrame(commit);
      teardown?.();
    };
  }, [containerRef, enabled, hasWidth]);

  // A width change moves the walls. Rebuilding the world here would drop the
  // pile on the floor again, which reads as a bug.
  useEffect(() => {
    if (width > 0) controlsRef.current?.resize(width);
  }, [width]);

  const reset = useCallback(() => controlsRef.current?.reset(), []);

  return { live, reset };
};
