import { recursiveMono } from "../fonts";
import type { HeroTerminalCopy } from "../types";
import {
  TerminalChips, TerminalInput, TerminalLog, TerminalPageLink, TerminalShell, TerminalSkipLink,
} from "./parts";
import { useTerminal } from "./useTerminal";

/**
 * The default assembly: window chrome, scrollback, prompt, chips.
 * Variants that need a different structure compose the pieces in `parts.tsx`
 * directly against `useTerminal`.
 */
export const Terminal = ({
  copy,
  className = "",
  logClassName = "h-[22rem] md:h-[26rem]",
}: {
  copy: HeroTerminalCopy;
  className?: string;
  logClassName?: string;
}) => {
  const term = useTerminal(copy);

  return (
    <TerminalShell className={`${recursiveMono.variable} rounded-lg border border-zinc-800 bg-zinc-950/80 ${className}`}>
      <TerminalSkipLink copy={copy} />
      <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
        <span className="ml-2 truncate text-xs text-zinc-500">{copy.windowTitle}</span>
        <span className="ml-auto"><TerminalPageLink copy={copy} /></span>
      </div>
      <TerminalLog term={term} copy={copy} className={`flex-1 px-4 py-3 ${logClassName}`} />
      <TerminalInput term={term} copy={copy} className="border-t border-zinc-800 px-4 py-3" />
      <TerminalChips term={term} copy={copy} className="border-t border-zinc-800/70 px-4 py-3" />
    </TerminalShell>
  );
};
