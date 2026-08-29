import { useRouter } from "next/router";
import { TerminalPageLink } from "../../terminal/parts";
import type { HeroTerminalCopy } from "../../types";

/**
 * `visitor@zsoltvarju:~$` -> `visitor@zsoltvarju`.
 *
 * The host is DERIVED from the prompt rather than stored as its own string, so
 * the status line and the prompt at the bottom of the screen can never disagree
 * and no new translation key is needed for a value that is identical in all
 * three locales.
 */
const hostFrom = (prompt: string) => prompt.replace(/[\s:~$#>]+$/, "") || prompt;

/**
 * T2's entire chrome: one monospace line, no title bar, no traffic lights.
 *
 * A tmux status bar rather than a window title — host on the left, the shell's
 * `ready` state next to it, the active locale and the "read as a page" escape
 * hatch pinned to the right edge of the viewport. It is full-bleed like
 * everything else in this variant, which is what makes it read as part of the
 * machine instead of as the top of a card.
 */
export const TtyStatusLine = ({
  copy,
  className = "",
}: {
  copy: HeroTerminalCopy;
  className?: string;
}) => {
  const router = useRouter();
  const locale = router.locale || "en";

  return (
    <div
      className={`flex shrink-0 items-center gap-2.5 border-y border-zinc-800 bg-zinc-950/60 py-1.5 text-[11px] leading-5 text-zinc-500 ${className}`}
    >
      <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
      <span className="truncate text-zinc-400">{hostFrom(copy.prompt)}</span>
      <span aria-hidden className="text-zinc-700">&middot;</span>
      <span className="truncate">{copy.ready}</span>
      <span className="ml-auto flex shrink-0 items-center gap-3 pl-3">
        <span className="uppercase tracking-[0.2em] text-zinc-600">{locale}</span>
        <TerminalPageLink copy={copy} />
      </span>
    </div>
  );
};
