import type { ReactNode } from "react";
import type { HeroTerminalCopy } from "../types";
import { CHIPS } from "./commands";
import type { Block, Line } from "./model";
import { PILL, Seg, stagger } from "./atoms";
import { WhoamiCard } from "./WhoamiCard";
import type { useTerminal } from "./useTerminal";

export type TerminalState = ReturnType<typeof useTerminal>;

const TONE: Record<Line["tone"], string> = {
  boot: "text-fg-3",
  out: "text-fg-2",
  head: "text-accent-hover font-semibold",
  muted: "text-fg-3",
  error: "text-warn",
};

/** The escape hatch. First focusable element inside the hero. */
export const TerminalSkipLink = ({ copy }: { copy: HeroTerminalCopy }) => (
  <a
    href="#about"
    className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded focus:bg-accent focus:px-3 focus:py-2 focus:text-sm focus:text-white"
  >
    {copy.skipLink}
  </a>
);

/** Traffic lights, centred title, and the way out. 40px. */
export const TerminalTitleBar = ({ copy }: { copy: HeroTerminalCopy }) => (
  <div className="grid h-10 shrink-0 grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-hairline bg-surface-2 px-4">
    <span aria-hidden className="flex items-center gap-2">
      <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/70" />
      <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/70" />
      <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/70" />
    </span>
    <span className="truncate text-center font-mono mono-1 text-xs text-fg-3">
      {copy.windowTitle}
    </span>
    <TerminalPageLink copy={copy} />
  </div>
);

/** One command and its output. Warp's block model. */
const TerminalBlock = ({
  block,
  term,
  copy,
}: {
  block: Block;
  term: TerminalState;
  copy: HeroTerminalCopy;
}) => {
  const isDemo = block.id === term.demoBlockId;

  return (
    <article className="mb-5 last:mb-0">
      {block.command !== null && (
        // The visitor's own keystrokes were already announced by the input;
        // re-announcing the echo would double up.
        <p aria-hidden className="text-fg-3">
          <span className="text-accent">{copy.prompt}</span>{" "}
          <span className="text-fg">
            {isDemo ? block.command.slice(0, term.typed) : block.command}
          </span>
          {isDemo && term.typed < term.demoCommand.length && (
            <span className="hero-caret text-accent">▍</span>
          )}
        </p>
      )}

      {block.command === "whoami" ? (
        <WhoamiCard lines={block.lines} onRun={term.run} asHeading={isDemo} />
      ) : (
        <div className="whitespace-pre-wrap break-words">
          {block.lines.map((line, i) => (
            <p key={i} className={`term-line ${TONE[line.tone]}`} style={stagger(i)}>
              {line.segments.map((segment, j) => (
                <Seg key={j} segment={segment} onRun={term.run} />
              ))}
            </p>
          ))}
        </div>
      )}
    </article>
  );
};

/**
 * The scrollback.
 *
 * The server-rendered blocks sit OUTSIDE the live region: the card owns the
 * page's <h1>, and a heading inside `aria-live` would be read out as an update
 * to a screen reader arriving on the page. Only what the visitor causes to be
 * printed is announced.
 */
export const TerminalLog = ({
  term,
  copy,
  className = "",
}: {
  term: TerminalState;
  copy: HeroTerminalCopy;
  className?: string;
}) => {
  const ssr = term.blocks.filter((b) => b.id < term.liveFrom);
  const live = term.blocks.filter((b) => b.id >= term.liveFrom);

  return (
    <div
      ref={term.logRef}
      // Set the moment the visitor does anything: a stagger that is still
      // playing while someone is reading or typing is noise, not feedback.
      data-done={term.instant ? "" : undefined}
      className={`min-h-0 overflow-y-auto overscroll-contain ${className}`}
    >
      {ssr.map((block) => (
        <TerminalBlock key={block.id} block={block} term={term} copy={copy} />
      ))}
      <div role="log" aria-live="polite" aria-busy={term.busy} aria-label={copy.logLabel}>
        {live.map((block) => (
          <TerminalBlock key={block.id} block={block} term={term} copy={copy} />
        ))}
      </div>
    </div>
  );
};

/** Prompt + input + fish-style ghost completion. 44px. */
export const TerminalInput = ({
  term,
  copy,
  className = "",
}: {
  term: TerminalState;
  copy: HeroTerminalCopy;
  className?: string;
}) => (
  <label className={`flex h-11 shrink-0 items-center gap-2 border-t border-hairline px-4 md:px-6 ${className}`}>
    <span className="sr-only">{copy.inputLabel}</span>
    <span aria-hidden className="shrink-0 text-accent">
      {copy.prompt}
    </span>
    <span className="relative flex min-w-0 flex-1 items-center">
      <input
        ref={term.inputRef}
        value={term.value}
        onChange={(e) => {
          term.stopDemo();
          term.setValue(e.target.value);
        }}
        onKeyDown={term.onKeyDown}
        // text-base keeps iOS from zooming the page on focus.
        className="w-full bg-transparent text-base text-fg caret-accent outline-none md:text-[13px]"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        enterKeyHint="go"
      />
      {term.ghost && (
        <span
          aria-hidden
          className="pointer-events-none absolute left-0 flex text-base text-fg-3 md:text-[13px]"
        >
          <span className="invisible">{term.value}</span>
          <span>{term.ghost}</span>
          <span className="ml-2 hidden text-[11px] text-fg-3 sm:inline">{copy.ghostHint}</span>
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
  term,
  copy,
  className = "",
}: {
  term: TerminalState;
  copy: HeroTerminalCopy;
  className?: string;
}) => (
  <div
    className={`chips-row scrollbar-hide flex shrink-0 items-center gap-1.5 overflow-x-auto border-t border-hairline px-4 py-2.5 sm:flex-wrap md:px-6 ${className}`}
  >
    {CHIPS.map((c) => (
      <button key={c} type="button" onClick={() => term.run(c)} className={PILL}>
        {c}
      </button>
    ))}
    <span className="ml-1 hidden shrink-0 text-[11px] text-fg-3 sm:inline">{copy.hintClick}</span>
  </div>
);

/**
 * The "read as a page" escape hatch. Two elements rather than one with a
 * responsive label: an aria-label cannot follow a media query, and `hidden`
 * takes the other out of the accessibility tree entirely.
 */
export const TerminalPageLink = ({ copy }: { copy: HeroTerminalCopy }) => (
  <>
    <a
      href="#about"
      aria-label={copy.readAsPage}
      className="rounded-sm px-1 text-xs text-fg-2 transition-colors hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent sm:hidden"
    >
      <span aria-hidden>↓</span>
    </a>
    <a
      href="#about"
      className="hidden shrink-0 rounded-sm text-xs text-fg-2 underline-offset-4 transition-colors hover:text-fg hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent sm:inline"
    >
      {copy.readAsPage}
    </a>
  </>
);

/** Applies the mono face. Wraps the window. */
export const TerminalShell = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
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
