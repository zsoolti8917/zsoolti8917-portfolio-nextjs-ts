import type { CSSProperties } from "react";

/**
 * The ambient instrument. Everything here is CSS + inline SVG on purpose:
 * V3 owns the canvas, and a hero that is *decorative* has no business
 * allocating a drawing context.
 *
 * The two moving parts are both Tailwind's stock `spin` keyframe at custom
 * durations, so there is no JS in the loop at all — which is what lets the
 * scope animate for a visitor whose JS never arrives, and what lets
 * `motion-reduce:animate-none` switch it off without a capability hook.
 * `paused` only ever writes `animation-play-state`, and its server value is
 * "running", so the markup the server sends is already the finished frame.
 */

/** indigo-500 #6366f1, indigo-300 #a5b4fc, zinc-700 #3f3f46. */
const SWEEP: CSSProperties = {
  backgroundImage:
    "conic-gradient(from 0deg," +
    "rgba(99,102,241,0) 0deg," +
    "rgba(99,102,241,0) 240deg," +
    "rgba(99,102,241,0.05) 300deg," +
    "rgba(99,102,241,0.28) 350deg," +
    "rgba(165,180,252,0.5) 360deg)",
  maskImage: "radial-gradient(circle at 50% 50%, transparent 6%, #000 34%)",
  WebkitMaskImage: "radial-gradient(circle at 50% 50%, transparent 6%, #000 34%)",
};

const GRID: CSSProperties = {
  backgroundImage:
    "linear-gradient(to right, rgba(63,63,70,0.30) 1px, transparent 1px)," +
    "linear-gradient(to bottom, rgba(63,63,70,0.30) 1px, transparent 1px)",
  backgroundSize: "18px 18px",
  maskImage: "radial-gradient(ellipse at 50% 50%, #000 25%, transparent 78%)",
  WebkitMaskImage: "radial-gradient(ellipse at 50% 50%, #000 25%, transparent 78%)",
};

const SCANLINES: CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(to bottom, rgba(0,0,0,0) 0 2px, rgba(0,0,0,0.28) 2px 3px)",
};

const BLIP: CSSProperties = { boxShadow: "0 0 10px 1px rgba(99,102,241,0.9)" };

const CORNER = "absolute h-2.5 w-2.5 border-zinc-700";

export const RadarScope = ({ paused }: { paused: boolean }) => {
  const play: CSSProperties = { animationPlayState: paused ? "paused" : "running" };

  return (
    <div
      aria-hidden="true"
      className="relative h-32 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950/60 lg:h-36"
    >
      <div className="absolute inset-0" style={GRID} />

      {/* The scope itself. Sized off the band's width and deliberately taller
          than the band, so it reads as a viewport onto a larger instrument
          instead of a circle floating in a box. */}
      <div className="absolute left-1/2 top-1/2 aspect-square w-[min(88%,13rem)] -translate-x-1/2 -translate-y-1/2">
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full text-indigo-500/30"
          focusable="false"
        >
          <g fill="none" stroke="currentColor">
            <circle cx="50" cy="50" r="49" strokeWidth="0.6" />
            <circle cx="50" cy="50" r="33" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="17" strokeWidth="0.5" />
            <path d="M50 2V98M2 50H98" strokeWidth="0.4" />
            <path
              d="M15 15 85 85M85 15 15 85"
              strokeWidth="0.4"
              strokeDasharray="2 4"
              opacity="0.7"
            />
          </g>
        </svg>

        <div
          className="absolute inset-0 rounded-full animate-spin motion-reduce:animate-none"
          style={{ ...SWEEP, ...play, animationDuration: "9s" }}
        />

        {/* Sits at r=33 because the wrapper is inset to 66% of the scope. */}
        <div
          className="absolute inset-[17%] animate-spin motion-reduce:animate-none"
          style={{ ...play, animationDuration: "23s", animationDirection: "reverse" }}
        >
          <span
            className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-300"
            style={BLIP}
          />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-60" style={SCANLINES} />

      <span className={`${CORNER} left-1.5 top-1.5 border-l border-t`} />
      <span className={`${CORNER} right-1.5 top-1.5 border-r border-t`} />
      <span className={`${CORNER} bottom-1.5 left-1.5 border-b border-l`} />
      <span className={`${CORNER} bottom-1.5 right-1.5 border-b border-r`} />
    </div>
  );
};
