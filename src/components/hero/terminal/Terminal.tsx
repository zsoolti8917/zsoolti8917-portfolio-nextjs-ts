import type { HeroCommonCopy, HeroTerminalCopy } from "../types";
import {
  TerminalChips, TerminalInput, TerminalLog, TerminalShell, TerminalSkipLink, TerminalTitleBar,
} from "./parts";
import { StatusBar } from "./StatusBar";
import { useTerminal } from "./useTerminal";

/**
 * The window, and the whole first screen.
 *
 * The height is DEFINITE, not a min-height: the scrollback is the only
 * flexible child, and without a definite height on its ancestor it would grow
 * to fit its content instead of scrolling — which would also make the
 * autoscroll effect a no-op. `100svh` rather than `dvh` so the on-screen
 * keyboard does not resize the window mid-sentence on iOS.
 *
 * Prompt row, chips row and status bar are SIBLINGS of the scrollback, so
 * nothing a visitor needs can scroll out of reach — including after `clear`.
 */
export const Terminal = ({
  copy,
  common,
}: {
  copy: HeroTerminalCopy;
  common: HeroCommonCopy;
}) => {
  const term = useTerminal(copy, common);

  return (
    <TerminalShell
      className={
        "relative h-[calc(100svh-56px)] overflow-hidden border-y border-hairline bg-surface-1 " +
        "md:mx-auto md:my-6 md:h-[calc(100svh-56px-3rem)] md:max-w-6xl md:rounded-xl md:border " +
        // The only shadow on the site. It lifts the window off the glow.
        "md:shadow-[0_0_0_1px_rgb(0_0_0/0.4),0_30px_80px_-30px_rgb(99_102_241/0.25)]"
      }
    >
      <TerminalSkipLink copy={copy} />
      <TerminalTitleBar copy={copy} />
      <TerminalLog term={term} copy={copy} className="flex-1 px-4 py-4 text-[13px] leading-[1.6] md:px-6" />
      <TerminalInput term={term} copy={copy} />
      <TerminalChips term={term} copy={copy} />
      <StatusBar copy={copy} />
    </TerminalShell>
  );
};
