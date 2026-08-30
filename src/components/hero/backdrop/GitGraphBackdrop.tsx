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
  layoutGroup,
  type Group,
} from "./gitgraph";

/**
 * The ambient layer behind the hero window: eight small git graphs drifting
 * down the desktop gutters, one commit landing every couple of seconds.
 *
 * Three rules keep it honest:
 *
 * - The graph is SERVER-RENDERED from a fixed seed, so it is there at first
 *   paint, for crawlers, and — still — for anyone who asked for less motion.
 *   Nothing in render reads the clock, `Math.random` or the window.
 * - The drift is a CSS transform on each `<svg>` root: compositor-only, no
 *   per-frame JavaScript beside the typing reveal. It is switched on by
 *   setting `data-live` from an effect (gated on `canAnimate`), never in JSX.
 * - Each `animationiteration` appends one commit INSIDE `flushSync`: the model
 *   shifts every row down by one in the same frame the transform snaps back
 *   by one row, so the conveyor never visibly jumps.
 */

/** Group centres from the section centre, mirrored into both gutters. */
const OFFSETS: number[] = GITGRAPH.OFFSETS.flatMap((o) => [-o, o]);

const GraphGroup = memo(
  ({ index, group, offset, delay }: { index: number; group: Group; offset: number; delay: number }) => {
    const layout = layoutGroup(group, METRICS);
    return (
      <svg
        className="gg-group"
        data-group={index}
        style={
          {
            left: `calc(50% + ${offset - GROUP_W / 2}px)`,
            width: GROUP_W,
            "--gg-delay": `${delay}ms`,
          } as CSSProperties
        }
      >
        <path data-main="" d={layout.main} />
        {layout.branches.map((b) => (
          <path key={b.key} d={b.d} />
        ))}
        {layout.nodes.map((n) => (
          <circle
            key={n.key}
            cx={n.x}
            cy={n.y}
            r={GITGRAPH.R}
            data-new={n.newest ? "" : undefined}
            data-merge={n.merge ? "" : undefined}
          />
        ))}
      </svg>
    );
  }
);
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

    const onIteration = (e: AnimationEvent) => {
      if (e.animationName !== "gg-drift") return;
      const i = Number((e.target as SVGSVGElement).dataset.group);
      if (Number.isNaN(i)) return;
      // Animation events dispatch before the style/layout/paint of the frame
      // that wraps; a plain setState would flush a task later, after that
      // frame painted, and the graph would jump up a row for one frame.
      flushSync(() => setGroups((gs) => gs.map((g, k) => (k === i ? appendCommit(g, OPTS) : g))));
    };
    root.addEventListener("animationiteration", onIteration);

    // Off-screen, the eight layers and their appends cost nothing.
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) root.dataset.live = "";
      else delete root.dataset.live;
    });
    io.observe(root);

    return () => {
      io.disconnect();
      root.removeEventListener("animationiteration", onIteration);
      delete root.dataset.live;
    };
  }, [canAnimate]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="gg pointer-events-none absolute inset-0 -z-10 hidden md:block"
      style={{ "--gg-row": `${GITGRAPH.ROW}px`, "--gg-interval": `${GITGRAPH.INTERVAL_MS}ms` } as CSSProperties}
    >
      {groups.map((g, i) => (
        <GraphGroup
          key={i}
          index={i}
          group={g}
          offset={OFFSETS[i]}
          delay={-Math.round((i * GITGRAPH.INTERVAL_MS) / OFFSETS.length)}
        />
      ))}
    </div>
  );
};
