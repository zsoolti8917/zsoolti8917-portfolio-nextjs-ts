import { RefObject, useEffect, useRef, useState } from "react";
import { cancelFrame, frame } from "framer-motion";
import type { DitherProgram, DitherUniforms } from "./gl";

/**
 * The React lifecycle around `./gl`.
 *
 * Contract with the caller: this hook never renders anything and never
 * decides whether the canvas exists. It reports one boolean — has the shader
 * put a frame on screen — and the variant uses it for nothing but opacity. If
 * WebGL is missing, refused (software fallback), or the program fails to
 * link, that boolean simply stays false and the CSS gradient underneath is
 * what the visitor keeps looking at.
 */

/**
 * framer-motion doesn't export `FrameData`, and we only need the clamped
 * delta off it. A narrower parameter type is assignable to its `Process`.
 */
type FrameStep = (data: { delta: number }) => void;

/** Per-frame approach rate for the pointer. Low enough to feel weighted. */
const POINTER_LERP = 0.08;

/**
 * The single frame reduced-motion visitors get, in shader seconds. Not
 * arbitrary: the field was swept over a minute of animation and this is where
 * it uses the widest span of the palette, so the still frame reads as a
 * composition rather than as a stalled loop.
 */
const STILL_TIME = 16;

/** Where the ripple sits before the pointer has ever moved. */
const RESTING_POINTER = { x: 0.62, y: 0.55 };

/** Coarse pointers drive the ripple from this slow orbit instead. */
const ORBIT = { x: 0.3, y: 0.22, rateX: 0.21, rateY: 0.29, phase: 1.1 };

interface PointerState {
  targetX: number;
  targetY: number;
  coarse: boolean;
}

interface Runtime {
  /** Stable identity — this exact function is what `cancelFrame` is given. */
  step: FrameStep;
  render: () => void;
  resize: (cssWidth: number, cssHeight: number) => void;
  setTime: (seconds: number) => void;
  dispose: () => void;
}

const createRuntime = (
  api: typeof import("./gl"),
  gl: WebGLRenderingContext,
  canvas: HTMLCanvasElement,
  handles: DitherProgram,
  uniforms: DitherUniforms,
  pointer: PointerState
): Runtime => {
  let time = 0;
  let size = { width: 1, height: 1 };

  // Smoothed pointer. Starts *at* the target so the very first frame is
  // composed, not mid-slide from the origin.
  let x = pointer.targetX;
  let y = pointer.targetY;

  const render = () => api.drawFrame(gl, uniforms, size, time, x, y);

  const step: FrameStep = (data) => {
    // Accumulated rather than derived from a timestamp: framer clamps delta to
    // 40ms, so a hero that was paused off-screen for a minute resumes exactly
    // where it stopped instead of jumping a minute of animation.
    time += data.delta / 1000;

    if (pointer.coarse) {
      pointer.targetX = 0.5 + ORBIT.x * Math.sin(time * ORBIT.rateX);
      pointer.targetY =
        0.5 + ORBIT.y * Math.sin(time * ORBIT.rateY + ORBIT.phase);
    }

    x += (pointer.targetX - x) * POINTER_LERP;
    y += (pointer.targetY - y) * POINTER_LERP;

    render();
  };

  return {
    step,
    render,
    resize: (cssWidth, cssHeight) => {
      size = api.applySize(gl, canvas, cssWidth, cssHeight);
    },
    setTime: (seconds) => {
      time = seconds;
    },
    dispose: () => api.disposeProgram(gl, handles),
  };
};

interface Options {
  /** On screen and tab visible. */
  active: boolean;
  reducedMotion: boolean;
  coarsePointer: boolean;
  /** CSS pixels, from `useElementSize`. */
  width: number;
  height: number;
}

export const useDitherField = (
  canvasRef: RefObject<HTMLCanvasElement>,
  { active, reducedMotion, coarsePointer, width, height }: Options
) => {
  const [ready, setReady] = useState(false);
  const runtimeRef = useRef<Runtime | null>(null);
  const pointerRef = useRef<PointerState>({
    targetX: RESTING_POINTER.x,
    targetY: RESTING_POINTER.y,
    coarse: false,
  });
  const reducedMotionRef = useRef(reducedMotion);

  /**
   * Capability values reach the GL side through refs, never through the init
   * effect's deps. `useMediaQuery` reports its server snapshot on the
   * hydration render and the real value one render later; rebuilding a linked
   * shader program on that flip would be pure waste. Declared before the init
   * effect so the refs are current by the time it runs.
   */
  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
  }, [reducedMotion]);

  useEffect(() => {
    pointerRef.current.coarse = coarsePointer;
  }, [coarsePointer]);

  // --- init / teardown / context restore ---------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;
    let api: typeof import("./gl") | null = null;
    let gl: WebGLRenderingContext | null = null;
    let handles: DitherProgram | null = null;
    let poll: FrameStep | null = null;

    const stopFrames = () => {
      if (poll) {
        cancelFrame(poll);
        poll = null;
      }
      const runtime = runtimeRef.current;
      if (runtime) {
        cancelFrame(runtime.step);
        runtimeRef.current = null;
      }
      return runtime;
    };

    const start = () => {
      if (disposed || !api || gl) return;

      const context = api.createContext(canvas);
      // No WebGL, or a context we refused because it would be software: the
      // canvas simply never becomes visible. Nothing else changes.
      if (!context) return;

      const built = api.createDitherProgram(context);
      if (!built) return;

      gl = context;
      handles = built;

      const loaded = api;
      const tick: FrameStep = () => {
        if (disposed) return;
        // Re-queued by `keepAlive` until the driver says the link is done.
        if (!loaded.isLinkFinished(context, built)) return;

        cancelFrame(tick);
        poll = null;

        const uniforms = loaded.finishProgram(context, built);
        if (!uniforms) {
          loaded.disposeProgram(context, built);
          handles = null;
          return;
        }

        const runtime = createRuntime(
          loaded,
          context,
          canvas,
          built,
          uniforms,
          pointerRef.current
        );
        if (reducedMotionRef.current) runtime.setTime(STILL_TIME);
        // Measured off the element rather than the debounced `useElementSize`
        // value, which is still 0x0 this early.
        runtime.resize(canvas.clientWidth, canvas.clientHeight);
        runtime.render();

        runtimeRef.current = runtime;
        // Only now, with a frame actually in the buffer, does the canvas fade
        // in over the CSS layer.
        setReady(true);
      };

      poll = tick;
      frame.read(tick, true);
    };

    const onContextLost = (event: Event) => {
      // Without preventDefault the browser never fires `webglcontextrestored`,
      // and the hero would be a dead black rectangle until a reload.
      event.preventDefault();
      stopFrames();
      // Every GL object is invalid now; nothing to delete, only to forget.
      handles = null;
      gl = null;
      setReady(false);
    };

    const onContextRestored = () => start();

    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);

    /**
     * Lazy on purpose: the shader source and the GL boilerplate are useless to
     * a visitor whose browser can't run them and irrelevant to first paint, so
     * they stay out of the chunk that carries the server-rendered headline.
     */
    import("./gl")
      .then((module) => {
        if (disposed) return;
        api = module;
        start();
      })
      .catch((error) => {
        if (process.env.NODE_ENV === "development") {
          console.error("[hero/v3] dither field failed to load", error);
        }
      });

    return () => {
      disposed = true;
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);

      const runtime = stopFrames();
      if (runtime) runtime.dispose();
      else if (api && gl && handles) api.disposeProgram(gl, handles);

      handles = null;
      gl = null;
      setReady(false);
    };
  }, [canvasRef]);

  // --- the loop ----------------------------------------------------------
  useEffect(() => {
    const runtime = runtimeRef.current;
    if (!ready || !runtime) return;

    if (reducedMotion) {
      // Exactly one frame, at a fixed time. No loop is ever scheduled.
      runtime.setTime(STILL_TIME);
      runtime.render();
      return;
    }

    if (!active) return;

    frame.render(runtime.step, true);
    return () => cancelFrame(runtime.step);
  }, [ready, active, reducedMotion]);

  // --- resize ------------------------------------------------------------
  useEffect(() => {
    const runtime = runtimeRef.current;
    if (!ready || !runtime || width === 0 || height === 0) return;
    runtime.resize(width, height);
    // A paused or reduced-motion canvas has no next frame to correct itself
    // with, so it gets one here.
    runtime.render();
  }, [ready, width, height]);

  // --- pointer -----------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    // Coarse pointers get the Lissajous orbit in `step` instead, and a
    // reduced-motion field never redraws, so neither attaches a listener.
    if (!canvas || coarsePointer || reducedMotion) return;

    const onPointerMove = (event: PointerEvent) => {
      // A layout read with no preceding write is free — this hook only ever
      // writes to the GL drawing buffer, never to the canvas's CSS box — so
      // measuring per event beats caching a rect that scroll would stale.
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const pointer = pointerRef.current;
      pointer.targetX = (event.clientX - rect.left) / rect.width;
      pointer.targetY = 1 - (event.clientY - rect.top) / rect.height; // GL's y runs up
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [canvasRef, coarsePointer, reducedMotion]);

  return ready;
};
