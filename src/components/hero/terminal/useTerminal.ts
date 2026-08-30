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
  DEMO_COMMANDS, DEMO_DONE, demoSchedule, headingBlockId, type RevealState, type Typed,
} from "./session";
import { useTerminalData } from "./useTerminalData";

/** A confident typist: ~26 keys a second, give or take a quarter. */
const TYPE_MS = 38;
const TYPE_JITTER = 0.25;
/** The beat between two demo headers — long enough to read as a pause. */
const GAP_MS = 450;
/** The beat between the demo pressing Enter and the output starting to print. */
const BEAT_MS = 120;
/** Ids below this were rendered on the server. Everything above is live output. */
const LIVE_FROM = DEMO_COMMANDS.length;
/** Once the visitor has fast-forwarded a reveal, nothing types for the session. */
const FAST_KEY = "term:instant";

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
   * role, current work, location and stack are legible on the first paint
   * with no JS, which is also what a crawler sees. The auto-demo does NOT
   * hide or re-run any of it in the markup: it types the command header in,
   * then reveals the card with a paint-only effect (`useTypeReveal`) over
   * text that is already in the DOM. Liveness is proven without ever
   * removing content.
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
  /** The demo is typing a header. */
  const [demoTyping, setDemoTyping] = useState(false);
  /** How many blocks are typing their output out right now. */
  const revealing = useRef(0);
  const [revealingCount, setRevealingCount] = useState(0);
  /** Cancels the demo and the sequential-print stagger for the rest of the session. */
  const [instant, setInstant] = useState(false);
  /** The visitor fast-forwarded a reveal; persisted for the session. */
  const [fast, setFast] = useState(false);
  /** The persisted flag has been read. Until then the pre-run card must wait. */
  const [ready, setReady] = useState(false);
  /** The pre-run block whose header the demo has typed; it may reveal now. */
  const [armed, setArmed] = useState<number | null>(null);
  const nextId = useRef(LIVE_FROM);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const ghost = ghostFor(value);

  // In an effect, never in the initialiser: the first client render must
  // match the server's, and the server has no sessionStorage.
  useEffect(() => {
    try {
      if (sessionStorage.getItem(FAST_KEY)) setFast(true);
    } catch {
      /* private mode, or storage blocked: every visit animates once */
    }
    setReady(true);
  }, []);

  const markFast = useCallback(() => {
    setFast(true);
    try {
      sessionStorage.setItem(FAST_KEY, "1");
    } catch {
      /* see above */
    }
  }, []);

  /**
   * Any interaction ends the demo. If a block was still typing itself out,
   * the interaction was also a fast-forward — the visitor has said they are
   * not here for the animation, so nothing types again this session.
   */
  const stopDemo = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setTyped(DEMO_DONE);
    setDemoTyping(false);
    setInstant(true);
    if (revealing.current > 0) markFast();
  }, [markFast]);

  const onRevealStart = useCallback(() => {
    revealing.current += 1;
    setRevealingCount(revealing.current);
  }, []);
  const onRevealEnd = useCallback(() => {
    revealing.current = Math.max(0, revealing.current - 1);
    setRevealingCount(revealing.current);
  }, []);

  // The demo: type the already-printed command in, character by character,
  // then — a beat later — arm its block, which types the output out over the
  // text already on screen. The schedule is a flat list of timeouts so
  // `stopDemo()` cancels the whole thing with one clear. Waits for `ready`:
  // a visitor who fast-forwarded earlier in the session gets no demo at all.
  useEffect(() => {
    if (!canAnimate || !ready || fast) return;
    setTyped({ block: 0, chars: 0 });
    setDemoTyping(true);
    const steps = demoSchedule(DEMO_COMMANDS, TYPE_MS, GAP_MS, TYPE_JITTER);
    steps.forEach((step, i) => {
      const last = i === steps.length - 1;
      timers.current.push(
        setTimeout(() => {
          setTyped(last ? DEMO_DONE : { block: step.block, chars: step.chars });
          if (last) setDemoTyping(false);
        }, step.at)
      );
    });
    const lastAt = steps[steps.length - 1]?.at ?? 0;
    timers.current.push(setTimeout(() => setArmed(DEMO_COMMANDS.length - 1), lastAt + BEAT_MS));
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
    // `fast` flipping true mid-demo is handled by stopDemo, which cleared the
    // timers already; re-running for it would only clear them again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canAnimate, ready]);

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

  /** A press anywhere in the output, on any pointer, is "get on with it". */
  useEffect(() => {
    const el = logRef.current;
    if (!el) return;
    el.addEventListener("pointerdown", stopDemo);
    return () => el.removeEventListener("pointerdown", stopDemo);
  }, [stopDemo]);

  /**
   * Bring the newest block into view without ever scrolling the page itself —
   * but only once there IS a newest block: nothing the visitor did caused the
   * pre-run card, so nothing should move on mount, and the same rule puts the
   * card back at the top after `clear`. The block's TOP, not the bottom of the
   * log: the block already occupies its final height while it types itself
   * out, so the bottom would be blank, and a long block is read from its
   * header down either way. `useTypeReveal` then follows the write head.
   */
  useEffect(() => {
    const el = logRef.current;
    if (!el) return;
    if (!blocks.some((b) => b.id >= LIVE_FROM)) {
      el.scrollTop = 0;
      return;
    }
    const article = el.querySelector<HTMLElement>("[role='log'] > article:last-child");
    el.scrollTop = article
      ? article.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop
      : el.scrollHeight;
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

  const reveal: RevealState = { canAnimate, ready, fast, instant, armed };

  return {
    blocks, value, setValue, ghost, run, onKeyDown,
    inputRef, logRef, focusInput, stopDemo,
    liveFrom: LIVE_FROM, headingBlockId: headingBlockId(blocks),
    typed, busy: demoTyping || revealingCount > 0, instant,
    reveal, onRevealStart, onRevealEnd,
  };
};
