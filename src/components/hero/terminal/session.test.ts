import { describe, expect, it } from "vitest";
import type { Block } from "./model";
import {
  DEMO_COMMANDS,
  DEMO_DONE,
  demoSchedule,
  headingBlockId,
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
  it("pre-runs the card and then the project list", () => {
    expect(DEMO_COMMANDS).toEqual(["whoami", "projects"]);
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
  const initial = [block(0, "whoami"), block(1, "projects")];

  it("gives the <h1> to the first whoami block on screen", () => {
    expect(headingBlockId(initial)).toBe(0);
  });

  it("keeps the <h1> after `clear` resets the scrollback to the card", () => {
    // R1: `clear` used to leave the page with no <h1> for the rest of the
    // session, because the heading was pinned to a block id that never came back.
    const cleared = initial.slice(0, 1);
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
