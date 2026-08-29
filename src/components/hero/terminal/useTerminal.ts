import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useTranslations } from "next-intl";
import { useTerminalBus } from "@/components/bus/TerminalBus";
import { getCVUrl, trackCvDownload } from "@/lib/cv";
import { useMotionCapabilities } from "../hooks/useMotionCapabilities";
import type { HeroCommonCopy, HeroTerminalCopy } from "../types";
import type { Block } from "./model";
import { ghostFor, runCommand, type CommandContext } from "./commands";
import {
  DEMO_COMMANDS, DEMO_DONE, demoSchedule, headingBlockId, type Typed,
} from "./session";
import { useTerminalData } from "./useTerminalData";

const TYPE_MS = 38;
/** The beat between the two demo headers — long enough to read as a pause. */
const GAP_MS = 450;
/** Ids below this were rendered on the server. Everything above is live output. */
const LIVE_FROM = DEMO_COMMANDS.length;

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
   * The server renders the result of BOTH demo commands, so the visitor's name,
   * role, current work, location and stack — and then the whole project list —
   * are legible on the first paint with no JS, which is also what a crawler
   * sees. Two blocks rather than one because one card leaves the window
   * two-thirds empty on a desktop. The auto-demo does NOT hide or re-run any of
   * it; it only types the two command headers in above output that is already
   * on screen. Liveness is proven without ever removing content.
   */
  const initialBlocks = useMemo<Block[]>(
    () =>
      DEMO_COMMANDS.map((command, id) => ({
        id,
        command,
        lines: runCommand(command, ctx).lines,
      })),
    [ctx]
  );

  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  /** How much of the demo headers is revealed. Starts complete, for SSR. */
  const [typed, setTyped] = useState<Typed>(DEMO_DONE);
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
    setTyped(DEMO_DONE);
    setBusy(false);
    setInstant(true);
  }, []);

  // The demo: type the already-printed commands in, character by character,
  // one after the other. The schedule is computed as a flat list of timeouts so
  // `stopDemo()` cancels the whole thing with one clear.
  useEffect(() => {
    if (!canAnimate) return;
    setTyped({ block: 0, chars: 0 });
    setBusy(true);
    const steps = demoSchedule(DEMO_COMMANDS, TYPE_MS, GAP_MS);
    steps.forEach((step, i) => {
      const last = i === steps.length - 1;
      timers.current.push(
        setTimeout(() => {
          setTyped(last ? DEMO_DONE : { block: step.block, chars: step.chars });
          if (last) setBusy(false);
        }, step.at)
      );
    });
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

      // Back to the identity card, not empty. The chips, the prompt and the
      // status bar live outside the scrollback, so a cleared window would still
      // have had six visible ways forward — but an empty one also takes the
      // page's only <h1> away from a screen reader for the rest of the session.
      // Keeping the card costs nothing and keeps the document valid; the header
      // prints statically, since the demo is over by the time anyone can clear.
      if (effect === "clear") {
        setBlocks(initialBlocks.slice(0, 1));
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

  /**
   * Keep the newest block in view without ever scrolling the page itself —
   * but only once there IS a newest block. The two pre-run blocks overflow a
   * phone, and scrolling to the bottom of them on mount would open the page on
   * the tail of the project list with the visitor's name already out of sight.
   * Nothing the visitor did caused them, so nothing should move. The same rule
   * puts the card back at the top after `clear`.
   */
  useEffect(() => {
    const el = logRef.current;
    if (!el) return;
    el.scrollTop = blocks.some((b) => b.id >= LIVE_FROM) ? el.scrollHeight : 0;
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
    liveFrom: LIVE_FROM, headingBlockId: headingBlockId(blocks),
    typed, busy, instant,
  };
};
