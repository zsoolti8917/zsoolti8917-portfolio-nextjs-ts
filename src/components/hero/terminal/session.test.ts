import { describe, expect, it } from "vitest";
import type { Block } from "./model";
import {
  DEMO_COMMANDS,
  DEMO_DONE,
  demoSchedule,
  headingBlockId,
  isDoneBlock,
  revealMode,
  revealed,
  type Typed,
} from "./session";

/**
 * The two decisions the shell makes that have no DOM in them: what the
 * auto-demo types and when, and which block owns the page's <h1>. Both are
 * invariants a screenshot cannot check, so they are unit-tested here rather
 * than inside `useTerminal`.
 */

const block = (id: number, command: string | null): Block => ({ id, command, lines: [] });

describe("DEMO_COMMANDS", () => {
  it("pre-runs the card, and only the card", () => {
    // The project list used to be pre-run under it. Eleven rows of monospace
    // in the least-read part of the viewport made the first screen a wall;
    // the same titles are in the Projects section of the same HTML anyway.
    expect(DEMO_COMMANDS).toEqual(["whoami"]);
  });
});

describe("demoSchedule", () => {
  const steps = demoSchedule(["whoami", "projects"], 10, 100);

  it("types every character of every command, in order", () => {
    expect(steps.map((s) => `${s.block}:${s.chars}`)).toEqual([
      "0:1", "0:2", "0:3", "0:4", "0:5", "0:6",
      "1:1", "1:2", "1:3", "1:4", "1:5", "1:6", "1:7", "1:8",
    ]);
  });

  it("spaces the keystrokes of one command by the type interval", () => {
    expect(steps.slice(0, 6).map((s) => s.at)).toEqual([10, 20, 30, 40, 50, 60]);
  });

  it("waits the gap after a command completes before starting the next", () => {
    const lastOfFirst = steps.filter((s) => s.block === 0).at(-1)!;
    const firstOfSecond = steps.find((s) => s.block === 1)!;
    expect(firstOfSecond.at - lastOfFirst.at).toBe(110); // gap + one keystroke
  });

  it("never goes backwards in time", () => {
    const times = steps.map((s) => s.at);
    expect(times).toEqual([...times].sort((a, b) => a - b));
  });

  it("ends on the last character of the last command", () => {
    expect(steps.at(-1)).toEqual({ block: 1, chars: 8, at: 240 });
  });

  it("handles a single command with no gap", () => {
    expect(demoSchedule(["cv"], 5, 100)).toEqual([
      { block: 0, chars: 1, at: 5 },
      { block: 0, chars: 2, at: 10 },
    ]);
  });

  it("is exact when no jitter is asked for, whatever the random source says", () => {
    expect(demoSchedule(["cv"], 10, 0, 0, () => 1)).toEqual([
      { block: 0, chars: 1, at: 10 },
      { block: 0, chars: 2, at: 20 },
    ]);
  });

  it("stretches or squeezes each keystroke by up to the jitter fraction", () => {
    // A fixed random source makes the extremes checkable: 1 → every key is
    // 25% slow, 0 → every key is 25% fast. Real typing sits in between.
    expect(demoSchedule(["cv"], 100, 0, 0.25, () => 1).map((s) => s.at)).toEqual([125, 250]);
    expect(demoSchedule(["cv"], 100, 0, 0.25, () => 0).map((s) => s.at)).toEqual([75, 150]);
  });

  it("never jitters the gap between commands", () => {
    const steps = demoSchedule(["ab", "cd"], 100, 300, 0.25, () => 1);
    const lastOfFirst = steps[1].at;
    const firstOfSecond = steps[2].at;
    expect(firstOfSecond - lastOfFirst).toBe(300 + 125);
  });
});

describe("revealed", () => {
  const typing: Typed = { block: 1, chars: 3 };

  it("shows a finished header in full", () => {
    expect(revealed(typing, 0, "whoami")).toBe(6);
  });

  it("shows the header being typed up to the cursor", () => {
    expect(revealed(typing, 1, "projects")).toBe(3);
  });

  it("shows nothing of a header whose turn has not come", () => {
    expect(revealed(typing, 2, "skills")).toBe(0);
  });

  it("completes every header once the demo is done — which is the SSR state", () => {
    DEMO_COMMANDS.forEach((command, i) => {
      expect(revealed(DEMO_DONE, i, command)).toBe(command.length);
    });
  });
});

describe("headingBlockId", () => {
  const initial = [block(0, "whoami")];

  it("gives the <h1> to the first whoami block on screen", () => {
    expect(headingBlockId([...initial, block(1, "projects")])).toBe(0);
  });

  it("keeps the <h1> after `clear` resets the scrollback to the card", () => {
    // R1: `clear` used to leave the page with no <h1> for the rest of the
    // session, because the heading was pinned to a block id that never came back.
    const cleared = [...initial, block(1, "skills")].slice(0, 1);
    expect(headingBlockId(cleared)).toBe(0);
  });

  it("does not depend on a fixed id: a later whoami owns the heading", () => {
    expect(headingBlockId([block(7, "help"), block(8, "whoami"), block(9, "whoami")])).toBe(8);
  });

  it("reports no heading when no card is on screen", () => {
    expect(headingBlockId([block(4, "skills")])).toBeNull();
  });

  it("never matches a headerless block", () => {
    expect(headingBlockId([block(0, null)])).toBeNull();
  });
});

describe("isDoneBlock", () => {
  const LIVE_FROM = 1;

  it("staggers everything while the demo is still running", () => {
    expect(isDoneBlock(block(0, "whoami"), LIVE_FROM, false)).toBe(false);
    expect(isDoneBlock(block(1, "projects"), LIVE_FROM, false)).toBe(false);
  });

  it("freezes the pre-run block once the visitor has interacted", () => {
    expect(isDoneBlock(block(0, "whoami"), LIVE_FROM, true)).toBe(true);
  });

  it("still staggers a block the visitor caused to be printed", () => {
    // R5: `data-done` used to be set on the whole log, so after the first
    // keystroke no command output ever animated in again — the shell stopped
    // looking like it was running anything.
    expect(isDoneBlock(block(1, "projects"), LIVE_FROM, true)).toBe(false);
    expect(isDoneBlock(block(9, "about"), LIVE_FROM, true)).toBe(false);
  });

  it("keeps the card frozen when `clear` re-prints it", () => {
    expect(isDoneBlock(block(0, "whoami"), LIVE_FROM, true)).toBe(true);
  });
});

describe("revealMode", () => {
  const LIVE_FROM = 1;
  const idle = { canAnimate: true, ready: true, fast: false, instant: false, armed: null };

  it("types a block the visitor caused to be printed", () => {
    expect(revealMode(block(3, "projects"), LIVE_FROM, idle)).toBe("type");
  });

  it("types nothing without motion capability — the server, or reduced motion", () => {
    const s = { ...idle, canAnimate: false, ready: false };
    expect(revealMode(block(3, "projects"), LIVE_FROM, s)).not.toBe("type");
    expect(revealMode(block(0, "whoami"), LIVE_FROM, { ...s, armed: 0 })).not.toBe("type");
  });

  it("settles a live block once the visitor has fast-forwarded a reveal", () => {
    expect(revealMode(block(3, "projects"), LIVE_FROM, { ...idle, fast: true })).toBe("settle");
  });

  it("makes the pre-run card wait until the demo has typed its header", () => {
    expect(revealMode(block(0, "whoami"), LIVE_FROM, idle)).toBe("wait");
  });

  it("types the pre-run card once the demo arms it", () => {
    expect(revealMode(block(0, "whoami"), LIVE_FROM, { ...idle, armed: 0 })).toBe("type");
  });

  it("settles the pre-run card if the visitor interacted before it was armed", () => {
    // The card must not stay hidden behind a deferred stagger: the visitor is
    // already reading, so show it now.
    expect(revealMode(block(0, "whoami"), LIVE_FROM, { ...idle, instant: true })).toBe("settle");
  });

  it("settles the pre-run card when a skip persisted from earlier in the session", () => {
    expect(revealMode(block(0, "whoami"), LIVE_FROM, { ...idle, fast: true })).toBe("settle");
  });

  it("does not settle the pre-run card before the client is ready — the deferral is what hides the flash", () => {
    expect(revealMode(block(0, "whoami"), LIVE_FROM, { ...idle, ready: false, canAnimate: false, fast: true })).toBe("wait");
  });

  it("only arms the block that was asked for", () => {
    expect(revealMode(block(0, "whoami"), LIVE_FROM, { ...idle, armed: 4 })).toBe("wait");
  });
});
