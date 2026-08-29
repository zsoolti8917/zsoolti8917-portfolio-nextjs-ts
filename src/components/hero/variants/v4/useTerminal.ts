import { KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { getCVUrl, trackCvDownload } from "@/lib/cv";
import { complete, runCommand } from "./commands";
import type {
  CommandContext,
  CommandEffect,
  DraftLine,
  TerminalLine,
} from "./commands";

/** Sentinel for "the boot text is fully printed" — the server's state. */
const ALL = Number.MAX_SAFE_INTEGER;
const BOOT_CHAR_MS = 18;
const MAX_LINES = 200;
const MAX_HISTORY = 50;
/** Long enough to read `guiLeaving` before the panel swaps. */
const LEAVE_MS = 450;

interface Options {
  ctx: CommandContext;
  /** From `useMotionCapabilities`. Gates the boot typing EFFECT, never JSX. */
  canAnimate: boolean;
  onLeave: () => void;
}

/**
 * History, line buffer and key handling for the Shell hero.
 *
 * The buffer is seeded with the boot lines at their full length, so the server
 * renders a finished terminal and hydration has nothing to reconcile. The
 * typewriter is an upgrade applied afterwards by rewinding a character counter
 * — the same shape as `useCountUp`, which renders its final value on the
 * server and animates up from zero only once mounted.
 */
export const useTerminal = ({ ctx, canAnimate, onLeave }: Options) => {
  const router = useRouter();
  const { copy } = ctx;

  const idRef = useRef(copy.boot.length);
  const [lines, setLines] = useState<TerminalLine[]>(() =>
    copy.boot.map((text, i) => ({ id: i, text, tone: "boot" as const }))
  );
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIndex, setHistIndex] = useState<number | null>(null);
  const [bootChars, setBootChars] = useState(ALL);

  const typeTimer = useRef<ReturnType<typeof setTimeout>>();
  const leaveTimer = useRef<ReturnType<typeof setTimeout>>();

  const bootTotal = copy.boot.reduce((n, line) => n + line.length, 0);

  useEffect(() => {
    if (!canAnimate || bootTotal === 0) return;

    setBootChars(0);
    let n = 0;
    const tick = () => {
      n += 1;
      setBootChars(n);
      if (n < bootTotal) typeTimer.current = setTimeout(tick, BOOT_CHAR_MS);
    };
    typeTimer.current = setTimeout(tick, BOOT_CHAR_MS);

    return () => {
      clearTimeout(typeTimer.current);
      setBootChars(ALL);
    };
  }, [canAnimate, bootTotal]);

  useEffect(() => () => clearTimeout(leaveTimer.current), []);

  /** Ids are stamped outside the updater: StrictMode invokes updaters twice. */
  const push = useCallback((drafts: DraftLine[]) => {
    if (drafts.length === 0) return;
    const start = idRef.current;
    idRef.current += drafts.length;
    setLines((prev) =>
      [...prev, ...drafts.map((d, i) => ({ ...d, id: start + i }))].slice(-MAX_LINES)
    );
  }, []);

  const applyEffect = useCallback(
    (effect: CommandEffect | undefined) => {
      switch (effect) {
        case "cv": {
          const locale = router.locale || "en";
          window.open(getCVUrl(locale));
          // The declarative `data-umami-event` the header uses needs an
          // element that was clicked; a typed command has none.
          trackCvDownload(locale);
          break;
        }
        case "contact":
          // scrollIntoView is right HERE — this is the page scrolling on
          // purpose, matching HeroActions. It is never used on the log.
          document.getElementById("contact")?.scrollIntoView();
          break;
        case "gui":
          leaveTimer.current = setTimeout(onLeave, LEAVE_MS);
          break;
        default:
          break;
      }
    },
    [router.locale, onLeave]
  );

  const run = useCallback(
    (raw: string) => {
      clearTimeout(typeTimer.current);
      setBootChars(ALL);
      setHistIndex(null);
      push([{ text: `${copy.prompt} ${raw}`.trimEnd(), tone: "echo" }]);

      const trimmed = raw.trim();
      if (trimmed) setHistory((h) => [...h, trimmed].slice(-MAX_HISTORY));

      const result = runCommand(raw, ctx);
      if (result.effect === "clear") {
        setLines([]);
        return;
      }
      push(result.lines);
      applyEffect(result.effect);
    },
    [applyEffect, ctx, copy.prompt, push]
  );

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.ctrlKey && (e.key === "l" || e.key === "L")) {
      e.preventDefault();
      clearTimeout(typeTimer.current);
      setBootChars(ALL);
      setLines([]);
      return;
    }
    if (e.ctrlKey || e.altKey || e.metaKey) return;

    switch (e.key) {
      case "Enter": {
        e.preventDefault();
        const raw = input;
        setInput("");
        run(raw);
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        if (history.length === 0) break;
        const next = histIndex === null ? history.length - 1 : Math.max(0, histIndex - 1);
        setHistIndex(next);
        setInput(history[next]);
        break;
      }
      case "ArrowDown": {
        e.preventDefault();
        if (histIndex === null) break;
        const next = histIndex + 1;
        if (next >= history.length) {
          setHistIndex(null);
          setInput("");
        } else {
          setHistIndex(next);
          setInput(history[next]);
        }
        break;
      }
      case "Tab": {
        e.preventDefault();
        const { value, suggestions } = complete(input);
        setInput(value);
        if (suggestions.length > 0) {
          push([
            { text: `${copy.prompt} ${input}`.trimEnd(), tone: "echo" },
            { text: `  ${suggestions.join("  ")}`, tone: "muted" },
          ]);
        }
        break;
      }
      default:
        break;
    }
  };

  /**
   * Boot lines are sliced to the typed length here rather than in state, so
   * `lines` always holds the real text and Ctrl+L / `clear` stay one-liners.
   */
  const displayLines = useMemo(() => {
    if (bootChars === ALL) return lines;
    const visible: TerminalLine[] = [];
    let offset = 0;
    for (const line of lines) {
      if (line.tone !== "boot") {
        visible.push(line);
        continue;
      }
      const chars = bootChars - offset;
      offset += line.text.length;
      if (chars <= 0) break;
      visible.push(chars >= line.text.length ? line : { ...line, text: line.text.slice(0, chars) });
    }
    return visible;
  }, [lines, bootChars]);

  return { lines: displayLines, input, setInput, onKeyDown, run };
};
