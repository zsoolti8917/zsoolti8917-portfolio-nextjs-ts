import { recursiveMono } from "../../fonts";
import {
  TerminalInput, TerminalLog, TerminalPageLink, TerminalShell, TerminalSkipLink,
} from "../../terminal/parts";
import { useTerminal } from "../../terminal/useTerminal";
import type { HeroTerminalCopy } from "../../types";
import { CommandRail } from "./CommandRail";
import { activeCommand } from "./rail";

/**
 * T4 — the split explorer. Two panes, read like a man page rather than a shell.
 *
 *   ┌──────────────────────────────────────────────┐
 *   │ windowTitle                    read as a page│
 *   ├───────────────┬──────────────────────────────┤
 *   │ every command │ output / <command>           │  <- pane header stays put
 *   │ + what it does├──────────────────────────────┤
 *   │ (never scrolls│ the scrollback, given room   │
 *   │  with output) │                              │
 *   │               ├──────────────────────────────┤
 *   │               │ prompt                       │
 *   └───────────────┴──────────────────────────────┘
 *
 * The grid gets a definite height at >= md, which is what lets the log be the
 * only thing that scrolls: the rail and the prompt are pinned by the layout,
 * not by `position: sticky`. Below md the grid collapses to one auto-height
 * column and the log carries its own height instead.
 *
 * `TerminalChips` is deliberately absent — the rail is the same promise kept
 * better, and rendering both would say the command set is two different sizes.
 */
export const SplitExplorer = ({ copy, className = "" }: { copy: HeroTerminalCopy; className?: string }) => {
  const term = useTerminal(copy);
  const active = activeCommand(term.blocks);

  return (
    <TerminalShell
      className={`${recursiveMono.variable} rounded-lg border border-zinc-800 bg-zinc-950/80 ${className}`}
    >
      <TerminalSkipLink copy={copy} />

      {/* Slim chrome across both panes. */}
      <div className="flex items-center gap-3 border-b border-zinc-800 px-4 py-2.5">
        <span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded-sm border border-indigo-500/60 bg-indigo-500/20" />
        <span className="truncate text-xs text-zinc-500">{copy.windowTitle}</span>
        <span className="ml-auto"><TerminalPageLink copy={copy} /></span>
      </div>

      <div className="grid grid-cols-1 md:h-[36rem] md:grid-cols-[17rem_minmax(0,1fr)]">
        <CommandRail term={term} copy={copy} active={active.rail} />

        <div className="flex min-h-0 flex-col">
          {/* Which command produced what is below. Sits above the scroll area,
              so it is still legible after a screenful of a role's duties. */}
          <div className="flex shrink-0 items-center gap-2 border-b border-zinc-800 px-4 py-2">
            <span className="shrink-0 text-[11px] uppercase tracking-widest text-zinc-500">
              {copy.logLabel}
            </span>
            <span aria-hidden className="shrink-0 text-zinc-700">/</span>
            <span className="truncate text-xs text-indigo-300">{active.raw ?? copy.ready}</span>
          </div>

          <TerminalLog
            term={term}
            copy={copy}
            className="h-[19rem] px-4 py-4 md:h-auto md:flex-1 md:px-6"
          />

          {/* Still a real prompt: `find <word>` and every synonym live here. */}
          <TerminalInput
            term={term}
            copy={copy}
            className="shrink-0 border-t border-zinc-800 px-4 py-3 md:px-6"
          />
        </div>
      </div>
    </TerminalShell>
  );
};
