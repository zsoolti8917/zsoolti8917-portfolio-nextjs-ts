import { RefObject, useEffect, useRef } from "react";
import { cancelFrame, frame } from "framer-motion";
import { useElementSize } from "../../hooks/useElementSize";
import { useInViewActive } from "../../hooks/useInViewActive";
import { WEIGHT_MAX } from "./kineticType";

const LETTER_SELECTOR = ".hero-kinetic-letter";

/**
 * Quantisation. A `wght` change forces the glyph to be re-shaped and
 * re-rastered — orders of magnitude dearer than a transform — so the weight is
 * snapped to nine levels and a letter whose level is unchanged is never
 * touched. Moving the cursor slowly across the headline writes a handful of
 * properties per frame, not one per letter.
 */
const WEIGHT_STEPS = 8;

/** Falloff. Sigma is derived from the measured letter box so the pull covers a
 *  similar number of letters at every font size; past `RADIUS_SIGMAS` the
 *  gaussian is already below one quantisation step, so the cut is invisible. */
const SIGMA_RATIO = 1.5;
const SIGMA_MIN = 60;
const SIGMA_MAX = 210;
const RADIUS_SIGMAS = 3;
const RADIUS_MAX = 380;

/** Stop the loop this long after the last pointer movement. Nothing is moving,
 *  so nothing needs recomputing; the weights simply stay where they are. */
const IDLE_MS = 400;

/** Time constant for the magnet fading in on enter / out on leave. */
const FADE_TAU_MS = 90;

/** Intro: a weight wave sweeping through the headline in reading order. It
 *  rides the same channel as the cursor effect — `--hw` on boxes whose width is
 *  already frozen — so it cannot reflow anything either. */
const WAVE_MS = 620;
const WAVE_STAGGER_MS = 14;
const WAVE_AMP = 0.62;

/**
 * Slack in each letter box, as a fraction of its advance at the rest weight.
 * The heaviest instance of a glyph is a few percent wider than the lightest;
 * the box is frozen, so that surplus has to come from somewhere or the swollen
 * letters kiss. Paired with the negative tracking on the <h1>, the rest state
 * still sits at roughly normal spacing.
 */
const WIDTH_HEADROOM = 1.06;

interface Options {
  /** Wraps the <h1>. Never remounted, so the observers stay attached. */
  rootRef: RefObject<HTMLElement>;
  /** Rest weight per letter, document order. Identity changes with the copy. */
  bases: Uint16Array;
  /** mounted && !reducedMotion — measurement and the intro wave. */
  enabled: boolean;
  /** …&& !coarsePointer — the cursor magnet itself. */
  proximity: boolean;
  /** Changes with the copy; replays the wave after a language switch. */
  replayKey: string;
}

/**
 * Drives `--hw` on the letter spans that `KineticHeadline` renders.
 *
 * THE constraint this whole hook is shaped around: a variable `wght` changes a
 * glyph's ADVANCE. Animating weight on auto-width letters re-flows the line
 * every frame, the letters slide out from under the cursor, that feeds straight
 * back into the proximity term, and the headline thrashes at 60fps. So every
 * letter's advance is measured once at its rest weight and written back as an
 * explicit `width`. After that the weight is a paint-only property.
 *
 * Everything else follows from "never read the DOM inside the loop": centres
 * are cached in page coordinates, scroll is mirrored by a passive listener, and
 * the loop's only DOM contact is `setProperty` on letters that actually changed.
 */
export const useKineticType = ({
  rootRef,
  bases,
  enabled,
  proximity,
  replayKey,
}: Options) => {
  const { width } = useElementSize(rootRef);
  const active = useInViewActive(rootRef);
  const introDoneRef = useRef(false);
  const introKeyRef = useRef<string | null>(null);

  useEffect(() => {
    // `width` is 0 until the ResizeObserver reports: waiting for it means one
    // measurement pass on a settled layout instead of two on a guess.
    if (!enabled || !active || width <= 0) return;

    const root = rootRef.current;
    if (!root) return;

    const els = Array.from(root.querySelectorAll<HTMLElement>(LETTER_SELECTOR));
    const n = els.length;
    // querySelectorAll is in document order, which is exactly the order
    // `splitHeadline` filled `bases` in. If they disagree the DOM isn't what
    // this hook thinks it is, and writing widths into it would be vandalism.
    if (n === 0 || n !== bases.length) return;

    if (introKeyRef.current !== replayKey) {
      introKeyRef.current = replayKey;
      introDoneRef.current = false;
    }

    // --- loop state: all of it local, so a StrictMode re-run starts clean ---
    const centers = new Float32Array(n * 2); // page coords, [x, y] per letter
    const steps = new Int8Array(n); // last quantised level written
    const scroll = { x: 0, y: 0 };
    const pointer = { x: -1e6, y: -1e6 };

    let measured = false;
    let sigmaInv = 0;
    let radius2 = 0;
    let strength = 0;
    let inside = false;
    let lastMove = 0;
    let lastTick = 0;
    let introStart = 0;
    let running = false;
    let disposed = false;

    const writeStep = (i: number, step: number) => {
      if (steps[i] === step) return; // the whole point of quantising
      steps[i] = step;
      const base = bases[i];
      els[i].style.setProperty(
        "--hw",
        String(Math.round(base + ((WEIGHT_MAX - base) * step) / WEIGHT_STEPS))
      );
    };

    const toBase = () => {
      for (let i = 0; i < n; i++) {
        steps[i] = -1; // force the write past the no-op guard
        writeStep(i, 0);
      }
    };

    const measure = () => {
      // Back to rest first: measuring a letter that is currently swollen would
      // freeze the wrong box for it. Resize can land mid-wave.
      toBase();

      // Release the boxes, read every advance, then write. Read-then-write, in
      // that order, once: no interleaving means one layout flush per pass.
      for (let i = 0; i < n; i++) els[i].style.width = "";
      const widths = els.map((el) => el.getBoundingClientRect().width);
      for (let i = 0; i < n; i++) {
        els[i].style.width = `${(widths[i] * WIDTH_HEADROOM).toFixed(2)}px`;
      }

      // Second pass for the centres, because the headroom above moved them.
      const sx = window.scrollX;
      const sy = window.scrollY;
      let boxHeight = 0;
      for (let i = 0; i < n; i++) {
        const r = els[i].getBoundingClientRect();
        centers[i * 2] = r.left + sx + r.width / 2;
        centers[i * 2 + 1] = r.top + sy + r.height / 2;
        if (r.height > boxHeight) boxHeight = r.height;
      }

      scroll.x = sx;
      scroll.y = sy;

      const sigma = Math.min(SIGMA_MAX, Math.max(SIGMA_MIN, boxHeight * SIGMA_RATIO));
      sigmaInv = 1 / (2 * sigma * sigma);
      const radius = Math.min(RADIUS_MAX, sigma * RADIUS_SIGMAS);
      radius2 = radius * radius;
      measured = true;
    };

    /** Returns true while the intro wave still has work to do. */
    const apply = (now: number) => {
      const introT = introStart > 0 ? now - introStart : -1;
      const introLive = introT >= 0 && introT <= WAVE_MS + n * WAVE_STAGGER_MS;

      const px = pointer.x;
      const py = pointer.y;
      const sx = scroll.x;
      const sy = scroll.y;
      const s = strength;

      for (let i = 0; i < n; i++) {
        let t = 0;

        if (s > 0) {
          // Page coords minus scroll = client coords, which is what the
          // pointer is stored in. No getBoundingClientRect, no scrollY read.
          const dx = centers[i * 2] - sx - px;
          const dy = centers[i * 2 + 1] - sy - py;
          const d2 = dx * dx + dy * dy;
          if (d2 < radius2) t = Math.exp(-d2 * sigmaInv) * s;
        }

        if (introLive) {
          const p = (introT - i * WAVE_STAGGER_MS) / WAVE_MS;
          if (p > 0 && p < 1) {
            const w = Math.sin(p * Math.PI) * WAVE_AMP;
            if (w > t) t = w;
          }
        }

        writeStep(i, t <= 0 ? 0 : Math.round(t * WEIGHT_STEPS));
      }

      if (!introLive && introStart > 0) {
        introStart = 0;
        introDoneRef.current = true;
      }
      return introLive;
    };

    const tick = () => {
      if (disposed) return;
      const now = performance.now();
      const dt = lastTick ? Math.min(64, now - lastTick) : 16;
      lastTick = now;

      const target = inside && proximity ? 1 : 0;
      if (strength !== target) {
        strength += (target - strength) * (1 - Math.exp(-dt / FADE_TAU_MS));
        if (Math.abs(target - strength) < 0.005) strength = target;
      }

      const introLive = measured ? apply(now) : false;

      // Idle stop. Combined with useInViewActive this loop is off almost all
      // of the time: it runs while the cursor moves and for 400ms after.
      if (
        !introLive &&
        strength === target &&
        (target === 0 || now - lastMove > IDLE_MS)
      ) {
        stop();
      }
    };

    const start = () => {
      if (running || disposed) return;
      running = true;
      lastTick = 0;
      frame.render(tick, true);
    };

    function stop() {
      if (!running) return;
      running = false;
      cancelFrame(tick);
    }

    const onScroll = () => {
      scroll.x = window.scrollX;
      scroll.y = window.scrollY;
    };

    const onMove = (e: PointerEvent) => {
      // A hybrid laptop reports a fine primary pointer; a stray touch would
      // otherwise teleport the magnet.
      if (e.pointerType === "touch") return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      inside = true;
      lastMove = performance.now();
      start();
    };

    const onLeave = () => {
      inside = false;
      lastMove = performance.now();
      start(); // run on just long enough to fade the magnet out
    };

    if (proximity) {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("blur", onLeave);
      document.documentElement.addEventListener("mouseleave", onLeave);
    }

    // Usable immediately with whatever face is painting right now…
    measure();

    const armIntro = () => {
      if (introDoneRef.current || introStart > 0) return;
      introStart = performance.now();
      start();
    };

    // …then again once the webfont has swapped in, because the fallback's
    // metrics are not Inter's and every cached centre would be wrong.
    const fonts = typeof document === "undefined" ? undefined : document.fonts;
    if (fonts && fonts.status !== "loaded") {
      fonts.ready
        .then(() => {
          if (disposed) return;
          measure();
          armIntro();
        })
        .catch(() => {});
    } else {
      armIntro();
    }

    return () => {
      disposed = true;
      stop();

      if (proximity) {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("blur", onLeave);
        document.documentElement.removeEventListener("mouseleave", onLeave);
      }

      // StrictMode re-runs this immediately, and a language switch re-runs it
      // against letters React is about to replace. Hand every span back the
      // design the server rendered — `--hw` is restored rather than removed,
      // because removing it would drop the letter to the var() fallback and
      // wipe the static gradient.
      for (let i = 0; i < n; i++) {
        els[i].style.width = "";
        els[i].style.setProperty("--hw", String(bases[i]));
      }
    };
  }, [rootRef, bases, enabled, proximity, replayKey, active, width]);
};
