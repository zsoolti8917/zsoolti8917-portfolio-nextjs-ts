import { useRef } from "react";
import { useMotionCapabilities } from "../hooks/useMotionCapabilities";
import { useCountUp } from "./useCountUp";
import type { HeroCommonCopy, HeroStats } from "../types";

interface Props {
  stats: HeroStats;
  common: HeroCommonCopy;
  layout?: "grid" | "inline";
}

const Stat = ({
  value,
  label,
  enabled,
  delayMs,
  inline,
}: {
  value: number;
  label: string;
  enabled: boolean;
  delayMs: number;
  inline: boolean;
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  useCountUp(ref, value, { enabled, delayMs });

  return (
    <div className={inline ? "flex items-baseline gap-2" : ""}>
      <span
        ref={ref}
        className={`font-black tabular-nums text-zinc-100 ${
          inline ? "text-xl" : "text-3xl md:text-4xl"
        }`}
      >
        {value}
      </span>
      <span
        className={`text-zinc-500 ${
          inline ? "text-xs" : "mt-1 block text-xs leading-snug"
        }`}
      >
        {label}
      </span>
    </div>
  );
};

/**
 * Every figure is a count of something already on the page (see useHeroStats),
 * so this can't overstate anything — which matters, because a metric that
 * looks disproportionate to its scope now reads as inflated rather than
 * impressive.
 */
export const ProofStrip = ({ stats, common, layout = "grid" }: Props) => {
  const { canAnimate } = useMotionCapabilities();
  const inline = layout === "inline";

  const items = [
    { value: stats.toolCount, label: common.proof.tools },
    { value: stats.projectCount, label: common.proof.projects },
    { value: stats.certCount, label: common.proof.certs },
    { value: stats.langCount, label: common.proof.langs },
  ];

  return (
    <div
      className={
        inline
          ? "flex flex-wrap items-baseline gap-x-6 gap-y-2"
          : "grid grid-cols-2 gap-6 sm:grid-cols-4"
      }
    >
      {items.map((item, i) => (
        <Stat
          key={item.label}
          value={item.value}
          label={item.label}
          enabled={canAnimate}
          delayMs={i * 80}
          inline={inline}
        />
      ))}
    </div>
  );
};
