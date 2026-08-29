import type { HeroCommonCopy } from "../types";

/**
 * "Currently at Serco" with a live dot. The pulse is pure CSS (`.hero-ping`
 * in globals.css) so it needs no capability hook and is switched off by the
 * reduced-motion block there.
 */
export const StatusPill = ({
  common,
  className = "",
}: {
  common: HeroCommonCopy;
  /** Lets a variant in a narrow column relax the pill, e.g. `text-[11px]`. */
  className?: string;
}) => (
  <div
    className={`inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 ${className}`}
  >
    <span className="relative flex h-2 w-2 shrink-0">
      <span className="hero-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
    </span>
    <span className="text-xs text-zinc-400">
      <span className="text-zinc-500">{common.statusLabel} — </span>
      {common.statusValue}
    </span>
  </div>
);
