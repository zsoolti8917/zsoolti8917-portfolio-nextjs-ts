import { useEffect, useRef, useState } from "react";
import { AiOutlineRadarChart } from "react-icons/ai";
import { StatusPill } from "../../parts/StatusPill";
import { useInViewActive } from "../../hooks/useInViewActive";
import type { HeroCommonCopy, HeroStats, HeroV1Copy } from "../../types";
import { RadarScope } from "./RadarScope";
import { ReadoutRow } from "./ReadoutRow";

interface Props {
  copy: HeroV1Copy;
  common: HeroCommonCopy;
  stats: HeroStats;
  /** From `useMotionCapabilities`. Read inside effects only — never in JSX. */
  canAnimate: boolean;
  /** `router.locale`. Remounts the readout so the counters replay on a
   *  language switch, which is the behaviour `util/Reveal` gives the rest of
   *  the page and the hero would otherwise look frozen without. */
  replayKey: string;
}

/**
 * The claim in the headline is a boast until something instruments it. Every
 * figure below is a count of something already rendered further down the page
 * (see `useHeroStats`), so the panel can be read as a readout rather than as
 * marketing.
 */
export const TelemetryPanel = ({
  copy,
  common,
  stats,
  canAnimate,
  replayKey,
}: Props) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const inView = useInViewActive(cardRef);

  // Starts `false` so the server (and a no-JS client) emit a running scope;
  // the observer only ever pauses it once we know it is off screen.
  const [paused, setPaused] = useState(false);
  useEffect(() => setPaused(!inView), [inView]);

  const rows: { label: string; value: number | string }[] = [
    { label: common.proof.tools, value: stats.toolCount },
    { label: common.proof.projects, value: stats.projectCount },
    { label: common.proof.certs, value: stats.certCount },
    { label: common.proof.langs, value: stats.langCount },
    { label: common.proof.years, value: stats.years },
    { label: common.proof.build, value: stats.buildDate },
  ];

  return (
    <div
      ref={cardRef}
      data-hero-rise
      className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 transition-colors hover:border-indigo-500/50 lg:p-5"
    >
      <h2 className="mb-4 flex items-center gap-2">
        <AiOutlineRadarChart className="shrink-0 text-lg text-indigo-500" />
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
          {copy.panelTitle}
        </span>
      </h2>

      <StatusPill common={common} />

      <div className="mt-4">
        <RadarScope paused={paused} />
      </div>

      <dl key={replayKey} className="mt-4">
        {rows.map((row, i) => (
          <ReadoutRow
            key={row.label}
            label={row.label}
            value={row.value}
            animate={canAnimate}
            delayMs={250 + i * 70}
          />
        ))}
      </dl>
    </div>
  );
};
