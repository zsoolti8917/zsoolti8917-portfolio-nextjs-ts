import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useTranslations } from "next-intl";
import { useTerminalBus } from "@/components/bus/TerminalBus";
import { getCVUrl, trackCvDownload } from "@/lib/cv";
import { useMotionCapabilities } from "../hooks/useMotionCapabilities";
import type { HeroCommonCopy, HeroTerminalCopy } from "../types";
import type { Block } from "./model";
import { ghostFor, runCommand, type CommandContext } from "./commands";
import { useTerminalData } from "./useTerminalData";

const DEMO_COMMAND = "whoami";
const TYPE_MS = 38;
/** Ids below this were rendered on the server. Everything above is live output. */
const LIVE_FROM = 1;

export const useTerminal = (copy: HeroTerminalCopy, common: HeroCommonCopy) => {
  const router = useRouter();
  const tr = useTranslations("hero.terminal");
  const data = useTerminalData();
  const { canAnimate, coarsePointer } = useMotionCapabilities();
  const { register } = useTerminalBus();

  const ctx: CommandContext = useMemo(
    () => ({
      copy,
      common,
      data,
      fmt: (key, values) => tr(key, values),
    }),
    [common, copy, data, tr]
  );

  /**
   * The server renders the result of the demo command, so the visitor's name,
   * role, current work, location and stack are legible on the first paint with
   * no JS — which is also what a crawler sees. The auto-demo does NOT hide or
   * re-run this; it only types the command header in above output that is
   * already on screen. Liveness is proven without ever removing content.
   */
  const initialBlocks = useMemo<Block[]>(
    () => [{ id: 0, command: DEMO_COMMAND, lines: runCommand(DEMO_COMMAND, ctx).lines }],
    [ctx]
  );

  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  /** Characters of the demo command revealed. Starts complete for SSR. */
  const [typed, setTyped] = useState(DEMO_COMMAND.length);
  const [busy, setBusy] = useState(false);
  /** Cancels the sequential-print stagger for the rest of the session. */
  const [instant, setInstant] = useState(false);
  const nextId = useRef(LIVE_FROM);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const ghost = ghostFor(value);

  const stopDemo = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setTyped(DEMO_COMMAND.length);
    setBusy(false);
    setInstant(true);
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

      // Empty, not "back to the banner": the chips, the prompt and the status
      // bar live outside the scrollback, so a cleared window is still a window
      // with six visible ways forward.
      if (effect === "clear") {
        setBlocks([]);
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
    [ctx, router.locale, stopDemo]
  );

  const focusInput = useCallback(() => {
    // Don't steal focus mid-selection — that would cancel a copy.
    if (window.getSelection()?.toString()) return;
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  // The ⌘K palette and anything else on the page reach the shell through here.
  useEffect(
    () =>
      register((cmd) => {
        run(cmd);
        inputRef.current?.focus({ preventScroll: true });
      }),
    [register, run]
  );

  /**
   * Click-to-focus, on fine pointers only. On a phone a tap anywhere in the
   * output would throw up the on-screen keyboard over the thing just tapped;
   * there the prompt row — a <label> wrapping the input — is the only way in.
   * Attached in an effect rather than as an onClick so the capability value
   * gates behaviour, never a JSX branch.
   */
  useEffect(() => {
    const el = logRef.current;
    if (!el || coarsePointer) return;
    el.addEventListener("click", focusInput);
    return () => el.removeEventListener("click", focusInput);
  }, [coarsePointer, focusInput]);

  // Keep the newest block in view without ever scrolling the page itself.
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [blocks]);

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
    demoCommand: DEMO_COMMAND, demoBlockId: 0, liveFrom: LIVE_FROM,
    typed, busy, instant,
  };
};
