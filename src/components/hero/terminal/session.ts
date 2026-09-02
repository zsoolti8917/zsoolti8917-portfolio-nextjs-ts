import type { Block } from "./model";

/**
 * The two session decisions that have no DOM in them, kept pure so they can be
 * tested without rendering the shell: what the auto-demo types and when, and
 * which block owns the page's <h1>.
 */

/**
 * The commands the server pre-runs, in order. One: the card.
 *
 * Its result is in the HTML from the first paint — the card answers "who is
 * this" for a recruiter and for a crawler that never runs JavaScript. The
 * project list used to be pre-run under it, to fill the window; a screenful of
 * monospace in the least-read part of the viewport made the first screen a
 * wall, and the same titles are in the Projects section of the same document
 * anyway. An open terminal with one card and empty scrollback is what a
 * terminal looks like. The auto-demo types the header in over the card, and
 * then types the card itself out — a paint-only reveal (`useTypeReveal`), so
 * the markup never changes and no content is ever removed.
 */
export const DEMO_COMMANDS = ["whoami"] as const;

/** One keystroke of the demo: `chars` of command `block` are visible at `at` ms. */
export interface DemoStep {
  block: number;
  chars: number;
  at: number;
}

/** How much of the demo has been typed. Blocks before `block` are complete. */
export interface Typed {
  block: number;
  chars: number;
}

/** Every header complete. The server renders this, and `stopDemo()` returns to it. */
export const DEMO_DONE: Typed = { block: DEMO_COMMANDS.length, chars: 0 };

/**
 * The whole demo as a flat list of timeouts to schedule: each command typed
 * one character every `typeMs` — give or take `jitter` (a fraction: 0.25
 * means each keystroke lands anywhere from 25% early to 25% late, which is
 * what stops it reading as a metronome) — with `gapMs` of stillness after a
 * command completes before the next one starts. A list rather than a chain of
 * nested timers so cancelling it is one `forEach(clearTimeout)`. `rand` is
 * injectable so the jitter can be tested at its extremes.
 */
export const demoSchedule = (
  commands: readonly string[],
  typeMs: number,
  gapMs: number,
  jitter = 0,
  rand: () => number = Math.random
): DemoStep[] => {
  const steps: DemoStep[] = [];
  let at = 0;

  commands.forEach((command, block) => {
    if (block > 0) at += gapMs;
    for (let chars = 1; chars <= command.length; chars += 1) {
      at += typeMs * (1 + jitter * (2 * rand() - 1));
      steps.push({ block, chars, at });
    }
  });

  return steps;
};

/** Characters of demo command `index` visible in the state `typed`. */
export const revealed = (typed: Typed, index: number, command: string): number => {
  if (index < typed.block) return command.length;
  if (index === typed.block) return typed.chars;
  return 0;
};

/**
 * Which block owns the page's <h1> — the FIRST `whoami` block currently on
 * screen, not a fixed id.
 *
 * Pinning the heading to one id meant that once that block left the scrollback
 * the page had no <h1> for the rest of the session, however many cards were
 * printed afterwards. Asking the list instead makes the invariant hold whatever
 * `clear` and the id counter do.
 */
export const headingBlockId = (blocks: Block[]): number | null =>
  blocks.find((b) => b.command === "whoami")?.id ?? null;

/**
 * Whether a block's output should skip the `.term-line` print stagger.
 *
 * Only the pre-run demo blocks ever do, and only once the visitor has
 * interacted (`instant`): replaying their reveal under someone who is already
 * reading or typing is noise. Blocks the visitor caused to be printed keep the
 * stagger for the whole session — it is the feedback that the shell just ran
 * the command. `data-done` used to go on the log root, which froze those too.
 * Reduced motion is handled in CSS, not here.
 */
export const isDoneBlock = (block: Block, liveFrom: number, instant: boolean): boolean =>
  instant && block.id < liveFrom;

/** What `useTypeReveal` should do with a block right now. */
export type RevealMode = "type" | "settle" | "wait";

export interface RevealState {
  /** Mounted on a client that has not asked for less motion. */
  canAnimate: boolean;
  /** The mount effect has run — the persisted skip flag has been read. */
  ready: boolean;
  /** The visitor fast-forwarded a reveal this session; nothing types again. */
  fast: boolean;
  /** The visitor interacted; the demo is over. */
  instant: boolean;
  /** The pre-run block the demo has typed the header of, and may now reveal. */
  armed: number | null;
}

/**
 * Which blocks type out, and when.
 *
 * A block the visitor caused types as soon as it mounts, unless they have
 * already fast-forwarded one — impatience is a stated preference. The pre-run
 * card is different: its stagger is DEFERRED in CSS so the server-painted
 * text is not shown in full and then hidden again while the page hydrates, so
 * it must "wait" until the demo has typed `whoami` and arms it, and it must
 * "settle" (run the stagger now) the moment it is clear it will not be typed
 * — the visitor interacted, or skipped earlier in the session — but never
 * before the client is ready, because until then the deferral is the only
 * thing preventing the flash.
 */
export const revealMode = (block: Block, liveFrom: number, s: RevealState): RevealMode => {
  if (block.id >= liveFrom) return s.canAnimate && !s.fast ? "type" : "settle";
  if (s.canAnimate && !s.fast && !s.instant && s.armed === block.id) return "type";
  return s.ready && (s.fast || s.instant) ? "settle" : "wait";
};
