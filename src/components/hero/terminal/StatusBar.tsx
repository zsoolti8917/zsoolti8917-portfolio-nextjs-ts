import type { HeroTerminalCopy } from "../types";
import { usePragueClock } from "./usePragueClock";

/**
 * Inlined by Next at build time (see next.config.mjs, which reads Netlify's
 * COMMIT_REF and falls back to the local git sha). A literal, so the server and
 * the client render the same seven characters.
 */
const COMMIT = process.env.NEXT_PUBLIC_COMMIT || "dev";

/**
 * The tmux-style footer.
 *
 * It earns its 28px by being the only place that says three true things at
 * once: this is a real build of a real repository, the clock is live, and the
 * person is available. Everything but the availability and the time collapses
 * on narrow screens, in that order.
 */
export const StatusBar = ({ copy }: { copy: HeroTerminalCopy }) => {
  const time = usePragueClock();

  return (
    <div className="flex h-7 shrink-0 items-center justify-between gap-4 border-t border-hairline bg-surface-2 px-4 font-mono mono-1 text-[11px] text-fg-3 md:px-6">
      <span className="hidden md:inline">{copy.statusBar.cwd}</span>
      <span className="hidden shrink-0 sm:inline">main@{COMMIT}</span>

      <span className="hidden lg:inline">{copy.statusBar.hints}</span>

      <span className="flex shrink-0 items-center gap-1.5 truncate">
        <span aria-hidden className="text-success">
          ●
        </span>
        <span className="truncate">{copy.status}</span>
      </span>
      <span className="shrink-0 tabular-nums">
        {copy.statusBar.zone} {time}
      </span>
    </div>
  );
};
