import { VscTerminal } from "react-icons/vsc";
import { TerminalInput } from "../../terminal/parts";
import type { TerminalState } from "../../terminal/parts";
import type { HeroTerminalCopy } from "../../types";

/**
 * The bottom panel, docked under the buffer the way a terminal is docked under
 * an editor: a lower surface, a slim header, smaller type. It reads as a
 * secondary pane of the same window rather than a second widget on the page —
 * which is the whole point of this variant, prose and prompt at once.
 */
export const DockedPanel = ({
  term,
  copy,
}: {
  term: TerminalState;
  copy: HeroTerminalCopy;
}) => (
  <div className="shrink-0 border-t border-zinc-800 bg-zinc-950">
    <div className="flex items-center gap-2 border-b border-zinc-800/60 px-3 py-1.5">
      <VscTerminal aria-hidden className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
      <span className="text-[11px] uppercase tracking-widest text-zinc-500">{copy.ready}</span>
      <span className="ml-auto hidden truncate pl-3 text-[11px] text-zinc-600 sm:inline">
        {copy.hintClick}
      </span>
    </div>
    <TerminalInput term={term} copy={copy} className="px-3 py-2.5 text-[12px]" />
  </div>
);
