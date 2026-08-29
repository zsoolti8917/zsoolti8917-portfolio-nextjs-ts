import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useTranslations } from "next-intl";
import { getCVUrl, trackCvDownload } from "@/lib/cv";
import { useMotionCapabilities } from "../hooks/useMotionCapabilities";
import type { HeroTerminalCopy } from "../types";
import { t, type Block } from "./model";
import { ghostFor, runCommand, type CommandContext } from "./commands";
import { useTerminalData } from "./useTerminalData";

const DEMO_COMMAND = "about";
const TYPE_MS = 38;

export const useTerminal = (copy: HeroTerminalCopy) => {
  const router = useRouter();
  const tr = useTranslations("hero.terminal");
  const data = useTerminalData();
  const { canAnimate } = useMotionCapabilities();

  const ctx: CommandContext = useMemo(
    () => ({
      copy,
      data,
      fmt: (key, values) => tr(key, values),
    }),
    [copy, data, tr]
  );

  /**
   * The server renders the boot banner AND the result of the demo command, so
   * the visitor's name, role and summary are legible on the first paint with
   * no JS — which is also what a crawler sees. The auto-demo does NOT hide or
   * re-run this; it only types the command header in above output that is
   * already on screen. Liveness is proven without ever removing content.
   */
  const initialBlocks = useMemo<Block[]>(
    () => [
      { id: 0, command: null, lines: copy.boot.map((line) => t(line, "boot")) },
      { id: 1, command: DEMO_COMMAND, lines: runCommand(DEMO_COMMAND, ctx).lines },
    ],
    [copy.boot, ctx]
  );

  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  /** Characters of the demo command revealed. Starts complete for SSR. */
  const [typed, setTyped] = useState(DEMO_COMMAND.length);
  const [busy, setBusy] = useState(false);
  const nextId = useRef(2);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const ghost = ghostFor(value);

  const stopDemo = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setTyped(DEMO_COMMAND.length);
    setBusy(false);
  }, []);

  // The demo: type the already-printed command in, character by character.
  useEffect(() => {
    if (!canAnimate) return;
    setTyped(0);
    setBusy(true);
    for (let i = 1; i <= DEMO_COMMAND.length; i += 1) {
      timers.current.push(
        setTimeout(() => {
          setTyped(i);
          if (i === DEMO_COMMAND.length) setBusy(false);
        }, i * TYPE_MS)
      );
    }
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [canAnimate]);

  const run = useCallback(
    (raw: string) => {
      stopDemo();
      const command = raw.trim();
      if (!command) return;

      const { lines, effect } = runCommand(command, ctx);
      setHistory((h) => [command, ...h.filter((x) => x !== command)].slice(0, 50));
      setHistoryIndex(-1);
      setValue("");

      if (effect === "clear") {
        setBlocks([initialBlocks[0]]);
      } else {
        setBlocks((b) => [...b, { id: nextId.current++, command, lines }]);
      }

      const locale = router.locale || "en";
      if (effect === "cv") {
        window.open(getCVUrl(locale));
        trackCvDownload(locale);
      }
      if (effect === "contact") document.getElementById("contact")?.scrollIntoView();
      if (effect === "page") document.getElementById("about")?.scrollIntoView();
    },
    [ctx, initialBlocks, router.locale, stopDemo]
  );

  // Keep the newest block in view without ever scrolling the page itself.
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [blocks]);

  const focusInput = useCallback(() => {
    // Don't steal focus mid-selection — that would cancel a copy.
    if (window.getSelection()?.toString()) return;
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      stopDemo();
      if (e.key === "Enter") {
        e.preventDefault();
        run(value);
        return;
      }
      // Ghost text is accepted with ArrowRight, never Tab: binding Tab would
      // swallow focus navigation and create a keyboard trap (WCAG 2.1.2).
      if (e.key === "ArrowRight" && ghost && e.currentTarget.selectionStart === value.length) {
        e.preventDefault();
        setValue(value + ghost);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        const i = Math.min(historyIndex + 1, history.length - 1);
        if (i >= 0) { setHistoryIndex(i); setValue(history[i]); }
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const i = historyIndex - 1;
        setHistoryIndex(i);
        setValue(i >= 0 ? history[i] : "");
        return;
      }
      if (e.key === "l" && e.ctrlKey) {
        e.preventDefault();
        run("clear");
      }
    },
    [ghost, history, historyIndex, run, stopDemo, value]
  );

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  return {
    blocks, value, setValue, ghost, run, onKeyDown,
    inputRef, logRef, focusInput, stopDemo,
    demoCommand: DEMO_COMMAND, typed, busy,
  };
};
