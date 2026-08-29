import type { Block } from "./model";

/**
 * The two session decisions that have no DOM in them, kept pure so they can be
 * tested without rendering the shell: what the auto-demo types and when, and
 * which block owns the page's <h1>.
 */

/**
 * The commands the server pre-runs, in order.
 *
 * BOTH results are in the HTML from the first paint and are never hidden — the
 * card answers "who is this", the project list answers "what has he built", and
 * together they fill the window instead of leaving it two-thirds empty. The
 * auto-demo only types the two headers in over output that is already on
 * screen; liveness is proven without ever removing content.
 */
export const DEMO_COMMANDS = ["whoami", "projects"] as const;

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
 * one character every `typeMs`, with `gapMs` of stillness after a command
 * completes before the next one starts. A list rather than a chain of nested
 * timers so cancelling it is one `forEach(clearTimeout)`.
 */
export const demoSchedule = (
  commands: readonly string[],
  typeMs: number,
  gapMs: number
): DemoStep[] => {
  const steps: DemoStep[] = [];
  let at = 0;

  commands.forEach((command, block) => {
    if (block > 0) at += gapMs;
    for (let chars = 1; chars <= command.length; chars += 1) {
      at += typeMs;
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
