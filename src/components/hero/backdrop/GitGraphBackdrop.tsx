import { memo, useEffect, useRef, useState, type CSSProperties } from "react";
import { flushSync } from "react-dom";
import { useMotionCapabilities } from "../hooks/useMotionCapabilities";
import {
  GITGRAPH,
  GROUP_W,
  METRICS,
  OPTS,
  appendCommit,
  createGroups,
  groupOffsets,
  layoutGroup,
  type Group,
} from "./gitgraph";

/**
 * The live layer behind the hero window: small git graphs tiling the desktop
 * gutters, a commit landing somewhere every couple of seconds.
 *
 * Three rules keep it honest:
 *
 * - The graph is SERVER-RENDERED from a fixed seed, so it is there at first
 *   paint, for crawlers, and — still — for anyone who asked for less motion.
 *   Nothing in render reads the clock, `Math.random` or the window.
 * - Nothing moves between events. When a commit lands, the model gains a row
 *   INSIDE `flushSync` and, in the same frame, the column slides down one row
 *   on the compositor (a WAAPI transform) while the new edge draws itself in
 *   (CSS on the `[data-new]` elements). Idle cost is zero.
 * - The scheduler lives in an effect gated on `canAnimate`, never in JSX;
 *   groups outside the viewport, or the hero off-screen, are skipped.
 */

const OFFSETS = groupOffsets();

const GraphGroup = memo(({ index, group, offset }: { index: number; group: Group; offset: number }) => {
  const layout = layoutGroup(group, METRICS);
  return (
    <svg
      className="gg-group"
      data-group={index}
      style={{ left: `calc(50% + ${offset - GROUP_W / 2}px)`, width: GROUP_W }}
    >
      {layout.edges.map((e) => (
        <path key={e.key} d={e.d} pathLength={1} data-c={e.c} data-new={e.newest ? "" : undefined} />
      ))}
      {layout.nodes.map((n) => (
        <circle
          key={n.key}
          cx={n.x}
          cy={n.y}
          r={GITGRAPH.R}
          data-c={n.c}
          data-new={n.newest ? "" : undefined}
          data-merge={n.merge ? "" : undefined}
        />
      ))}
    </svg>
  );
});
GraphGroup.displayName = "GraphGroup";

export const GitGraphBackdrop = () => {
  // Identical on the server and the client: the seed is a constant.
  const [groups, setGroups] = useState(() => createGroups(GITGRAPH.SEED, OFFSETS.length, OPTS));
  const { canAnimate } = useMotionCapabilities();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canAnimate) return;
    const root = ref.current;
    if (!root) return;
    const svgs = Array.from(root.querySelectorAll<SVGSVGElement>(".gg-group"));
    const timers: number[] = [];
    let onScreen = true;

    // Groups beyond the viewport edge get no events; nothing would show.
    const visible = (k: number) => Math.abs(OFFSETS[k]) - GROUP_W / 2 < root.clientWidth / 2;
    const jittered = () => GITGRAPH.INTERVAL_MS * (1 + GITGRAPH.JITTER * (Math.random() * 2 - 1));

    const land = (k: number) => {
      // Same frame for both, or the column slides before the row exists.
      flushSync(() => setGroups((gs) => gs.map((g, i) => (i === k ? appendCommit(g, OPTS) : g))));
      svgs[k]?.animate?.(
        [{ transform: `translateY(-${GITGRAPH.ROW}px)` }, { transform: "translateY(0)" }],
        { duration: GITGRAPH.SHIFT_MS, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)" }
      );
    };
    const schedule = (k: number, ms: number) => {
      timers[k] = window.setTimeout(() => {
        if (onScreen && visible(k)) land(k);
        schedule(k, jittered());
      }, ms);
    };
    // Spread the first events across one interval so they do not arrive as one.
    svgs.forEach((_, k) => schedule(k, ((k * GITGRAPH.INTERVAL_MS) / svgs.length) * (0.5 + Math.random())));

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
    });
    io.observe(root);

    return () => {
      io.disconnect();
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [canAnimate]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="gg pointer-events-none absolute inset-0 -z-10 hidden md:block"
      style={{ "--gg-row": `${GITGRAPH.ROW}px` } as CSSProperties}
    >
      {groups.map((g, i) => (
        <GraphGroup key={i} index={i} group={g} offset={OFFSETS[i]} />
      ))}
    </div>
  );
};
