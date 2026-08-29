import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { PROJECTS } from "@/components/projects/Projects";
import { recursiveMono } from "../../fonts";
import { useMotionCapabilities } from "../../hooks/useMotionCapabilities";
import type { HeroStats, HeroV4Copy } from "../../types";
import { TOUCH_COMMANDS } from "./commands";
import type { Tone } from "./commands";
import { TouchCommandBar } from "./TouchCommandBar";
import { useTerminal } from "./useTerminal";

interface Props {
  copy: HeroV4Copy;
  stats: HeroStats;
  onLeave: () => void;
}

const TONE: Record<Tone, string> = {
  boot: "text-zinc-400",
  echo: "text-zinc-500",
  out: "text-zinc-300",
  head: "font-semibold text-zinc-100",
  muted: "text-zinc-500",
  error: "text-rose-400",
};

/**
 * Recursive only becomes a monospace at MONO 1 — the axis is what the family
 * is for. Stated inline so `fonts.ts` and `globals.css` stay untouched, and
 * with a real monospace fallback stack: a terminal in a proportional fallback
 * is worse than a terminal in Menlo.
 */
const MONO = {
  fontFamily: "var(--font-recursive), ui-monospace, SFMono-Regular, Menlo, monospace",
  fontVariationSettings: '"MONO" 1',
} as const;

export const Terminal = ({ copy, stats, onLeave }: Props) => {
  const t = useTranslations("hero");
  const tProjects = useTranslations("projects");
  const { canAnimate } = useMotionCapabilities();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);

  const ctx = useMemo(
    () => ({
      copy,
      // The ordered, curated array — not Object.keys on the namespace — with
      // each title read from the same messages the Projects section renders.
      projects: PROJECTS.map((p) => tProjects(`${p.key}.title`)),
      stack: stats.stack,
      notFound: (cmd: string) => t("v4.notFound", { cmd }),
    }),
    [copy, stats.stack, t, tProjects]
  );

  const { lines, input, setInput, onKeyDown, run } = useTerminal({
    ctx,
    canAnimate,
    onLeave,
  });

  // Scrolls the LOG, not the page. `scrollIntoView` here would drag the whole
  // document every time a command printed.
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  /** Never on mount — that opens the virtual keyboard on page load. */
  const focusInput = () => {
    if (window.getSelection()?.toString()) return; // don't kill a copy
    inputRef.current?.focus({ preventScroll: true });
  };

  return (
    <div
      className={`${recursiveMono.variable} rounded-lg border border-zinc-800 bg-zinc-950/70 p-4 text-sm shadow-xl shadow-black/30`}
      style={MONO}
    >
      <div className="mb-3 flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
      </div>

      {/* min-h, never h: the mobile keyboard shrinks the viewport and a fixed
          height would clip the prompt right when it is being typed into. */}
      <div className="min-h-[15rem] cursor-text" onClick={focusInput}>
        <div
          ref={logRef}
          role="log"
          aria-live="polite"
          aria-label={copy.boot[0]}
          className="max-h-[17rem] space-y-1 overflow-y-auto md:max-h-[20rem]"
        >
          {lines.map((line) => (
            <p key={line.id} className={`whitespace-pre-wrap break-words ${TONE[line.tone]}`}>
              {line.text}
            </p>
          ))}
        </div>

        <div className="mt-1 flex items-start">
          <span className="shrink-0 text-indigo-400">{copy.prompt}</span>
          <span className="ml-2 min-w-0 flex-1 break-words text-zinc-200">
            {input}
            <span
              aria-hidden
              className={`ml-px inline-block h-[1.05em] w-[0.55em] translate-y-[0.15em] motion-reduce:animate-none ${
                focused ? "hero-caret bg-indigo-400" : "bg-zinc-700"
              }`}
            />
          </span>
        </div>

        {/* The only key surface. A document-level keydown listener would
            swallow keystrokes meant for the header's language dropdown. */}
        <label htmlFor={inputId} className="sr-only">
          {copy.hint}
        </label>
        <input
          id={inputId}
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          // 16px or iOS zooms the whole page on focus. The field is invisible.
          className="sr-only text-base"
          type="text"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="go"
        />
      </div>

      <TouchCommandBar
        commands={TOUCH_COMMANDS}
        onRun={(cmd) => {
          setInput("");
          run(cmd);
        }}
        className="md:hidden"
      />
    </div>
  );
};
