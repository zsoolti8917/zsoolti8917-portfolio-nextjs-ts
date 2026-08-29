import type { ReactNode } from "react";
import type { HeroTerminalCopy } from "../types";
import { CHIPS } from "./commands";
import type { Line, Segment } from "./model";
import type { useTerminal } from "./useTerminal";

export type TerminalState = ReturnType<typeof useTerminal>;

const TONE: Record<Line["tone"], string> = {
  boot: "text-zinc-500",
  out: "text-zinc-300",
  head: "text-indigo-300 font-semibold",
  muted: "text-zinc-500",
  error: "text-amber-300",
};

/**
 * A segment is a button when it can run a command, an anchor when it points
 * somewhere, and plain text otherwise. This is the whole reason a visitor can
 * traverse the entire CV with a mouse and never type a character.
 */
const Seg = ({ segment, onRun }: { segment: Segment; onRun: (cmd: string) => void }) => {
  const link =
    "rounded-sm text-indigo-300 underline decoration-indigo-300/30 underline-offset-4 transition-colors hover:bg-indigo-500/10 hover:text-indigo-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400";
  if (segment.run) {
    return (
      <button type="button" onClick={() => onRun(segment.run as string)} className={link}>
        {segment.text}
      </button>
    );
  }
  if (segment.href) {
    return (
      <a href={segment.href} target="_blank" rel="noreferrer nofollow" className={link}>
        {segment.text}
      </a>
    );
  }
  return <span>{segment.text}</span>;
};

/** The escape hatch. Should be the first focusable element on the page. */
export const TerminalSkipLink = ({ copy }: { copy: HeroTerminalCopy }) => (
  <a
    href="#about"
    className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded focus:bg-indigo-500 focus:px-3 focus:py-2 focus:text-sm focus:text-white"
  >
    {copy.skipLink}
  </a>
);

/** The scrollback. Warp-style blocks: one <article> per command. */
export const TerminalLog = ({
  term, copy, className = "",
}: { term: TerminalState; copy: HeroTerminalCopy; className?: string }) => (
  // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
  <div
    ref={term.logRef}
    onClick={term.focusInput}
    role="log"
    aria-live="polite"
    aria-busy={term.busy}
    aria-label={copy.logLabel}
    className={`min-h-0 overflow-y-auto text-[13px] leading-relaxed ${className}`}
  >
    {term.blocks.map((block) => (
      <article key={block.id} className="mb-3 last:mb-0">
        {block.command !== null && (
          // The visitor's own keystrokes were already announced by the input;
          // re-announcing the echo would double up.
          <p aria-hidden className="text-zinc-500">
            <span className="text-indigo-400">{copy.prompt}</span>{" "}
            <span className="text-zinc-200">
              {block.id === 1 ? block.command.slice(0, term.typed) : block.command}
            </span>
            {block.id === 1 && term.typed < term.demoCommand.length && (
              <span className="hero-caret text-indigo-400">▍</span>
            )}
          </p>
        )}
        <div className="whitespace-pre-wrap break-words">
          {block.lines.map((line, i) => (
            <p key={i} className={TONE[line.tone]}>
              {line.segments.map((segment, j) => (
                <Seg key={j} segment={segment} onRun={term.run} />
              ))}
            </p>
          ))}
        </div>
      </article>
    ))}
  </div>
);

/** Prompt + input + fish-style ghost completion. */
export const TerminalInput = ({
  term, copy, className = "", showPrompt = true,
}: { term: TerminalState; copy: HeroTerminalCopy; className?: string; showPrompt?: boolean }) => (
  <label className={`flex items-center gap-2 ${className}`}>
    <span className="sr-only">{copy.inputLabel}</span>
    {showPrompt && <span aria-hidden className="shrink-0 text-indigo-400">{copy.prompt}</span>}
    <span className="relative flex min-w-0 flex-1 items-center">
      <input
        ref={term.inputRef}
        value={term.value}
        onChange={(e) => { term.stopDemo(); term.setValue(e.target.value); }}
        onKeyDown={term.onKeyDown}
        // text-base keeps iOS from zooming the page on focus.
        className="w-full bg-transparent text-base text-zinc-100 caret-indigo-400 outline-none md:text-[13px]"
        autoComplete="off" autoCorrect="off" autoCapitalize="off"
        spellCheck={false} enterKeyHint="go"
      />
      {/* zinc-400, not zinc-600: a hint nobody can read is not a hint. */}
      {term.ghost && (
        <span aria-hidden className="pointer-events-none absolute left-0 flex text-base text-zinc-400 md:text-[13px]">
          <span className="invisible">{term.value}</span>
          <span>{term.ghost}</span>
          <span className="ml-2 hidden text-[11px] text-zinc-600 sm:inline">{copy.ghostHint}</span>
        </span>
      )}
    </span>
  </label>
);

/**
 * Permanently OUTSIDE the scrollback. In the output they would scroll away,
 * and `clear` would leave a dead end with no visible way forward — the single
 * most-reported failure of terminal portfolios.
 */
export const TerminalChips = ({
  term, copy, className = "",
}: { term: TerminalState; copy: HeroTerminalCopy; className?: string }) => (
  <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
    {CHIPS.map((c) => (
      <button
        key={c}
        type="button"
        onClick={() => term.run(c)}
        className="rounded border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-300 transition-colors hover:border-indigo-500/60 hover:text-indigo-300"
      >
        {c}
      </button>
    ))}
    <span className="ml-1 text-[11px] text-zinc-500">{copy.hintClick}</span>
  </div>
);

/** The "read as a page" escape hatch, for the chrome row. */
export const TerminalPageLink = ({ copy }: { copy: HeroTerminalCopy }) => (
  <a
    href="#about"
    className="shrink-0 text-xs text-zinc-400 underline-offset-4 transition-colors hover:text-indigo-300 hover:underline"
  >
    {copy.readAsPage}
  </a>
);

/** Applies the mono face. Wrap whatever chrome a variant builds. */
export const TerminalShell = ({
  children, className = "",
}: { children: ReactNode; className?: string }) => (
  <div
    className={`flex min-h-0 flex-col ${className}`}
    style={{
      fontFamily: "var(--font-recursive), ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
      fontVariationSettings: '"MONO" 1',
    }}
  >
    {children}
  </div>
);
