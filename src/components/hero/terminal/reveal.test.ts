import { describe, expect, it } from "vitest";
import { REVEAL, revealSchedule, weight } from "./reveal";

/**
 * The pacing of typed-out output, kept pure so the one property that matters
 * can be asserted without a DOM: a block never takes longer than its budget
 * unless the cps ceiling forces it to, and never shorter than the cps floor
 * allows. Adult reading is ~20 chars/s; anything slower than the reader is
 * the visitor waiting on a gimmick.
 */

// A wide-open clamp, so the budget is what each test sees unless it narrows it.
const opts = { budgetMs: 1000, minCps: 1, maxCps: 10_000, lineBreakMs: 0, maxPausedLines: 12 };

const total = (lines: string[], o = opts) => {
  const s = revealSchedule(lines, o);
  return s.time[s.total];
};

describe("weight", () => {
  it("gives sentence punctuation the longest beat, clause punctuation a shorter one", () => {
    expect(weight(".")).toBe(7);
    expect(weight("?")).toBe(7);
    expect(weight(",")).toBe(4);
    expect(weight("·")).toBe(4);
    expect(weight("a")).toBe(1);
    expect(weight(" ")).toBe(1);
  });
});

describe("revealSchedule", () => {
  it("is empty for an empty block", () => {
    const s = revealSchedule([], opts);
    expect(s.total).toBe(0);
    expect(Array.from(s.time)).toEqual([0]);
  });

  it("ignores blank lines but counts every character of the others", () => {
    expect(revealSchedule(["ab", "", "c"], opts).total).toBe(3);
  });

  it("starts at zero and spends the whole budget on a block inside the clamp", () => {
    const s = revealSchedule(["abcd"], opts);
    expect(s.time[0]).toBe(0);
    expect(s.time[s.total]).toBeCloseTo(1000);
  });

  it("spaces plain characters evenly", () => {
    const s = revealSchedule(["abcd"], opts);
    expect(Array.from(s.time)).toEqual([0, 250, 500, 750, 1000]);
  });

  it("redistributes time toward punctuation instead of adding it", () => {
    const s = revealSchedule(["a."], opts);
    const a = s.time[1] - s.time[0];
    const dot = s.time[2] - s.time[1];
    expect(dot).toBeCloseTo(a * 7);
    expect(s.time[2]).toBeCloseTo(1000);
  });

  it("never goes backwards", () => {
    const s = revealSchedule(["Hello, world.", "Second line!"], opts);
    const t = Array.from(s.time);
    expect(t).toEqual([...t].sort((x, y) => x - y));
  });

  it("floods rather than crawls: a long block is capped at the cps ceiling", () => {
    const lines = ["x".repeat(3000)];
    expect(total(lines, { ...opts, maxCps: 1000 })).toBeCloseTo(3000);
  });

  it("stays legible: a short block is held at the cps floor, not stretched to the budget", () => {
    // 2 chars at 10 cps = 200 ms, not 1000.
    expect(total(["ab"], { ...opts, minCps: 10 })).toBeCloseTo(200);
  });

  it("adds a beat at the end of each line and pays for it out of the budget", () => {
    const o = { ...opts, lineBreakMs: 100 };
    const s = revealSchedule(["ab", "cd"], o);
    // Two lines → two pauses → 200 ms of the 1000 go to pauses, 800 to characters.
    expect(s.time[2] - s.time[1]).toBeCloseTo(200 + 100); // 'b' plus the line beat
    expect(s.time[s.total]).toBeCloseTo(1000);
  });

  it("stops pausing after the first maxPausedLines lines so a long list does not stutter", () => {
    const o = { ...opts, lineBreakMs: 100, maxPausedLines: 2 };
    const s = revealSchedule(["a", "b", "c", "d"], o);
    const gaps = [1, 2, 3, 4].map((i) => s.time[i] - s.time[i - 1]);
    expect(gaps[0]).toBeCloseTo(gaps[1]); // both paused
    expect(gaps[2]).toBeCloseTo(gaps[3]); // both not
    expect(gaps[0]).toBeCloseTo(gaps[2] + 100);
    expect(s.time[s.total]).toBeCloseTo(1000);
  });

  it("with the shipped defaults keeps the worst real block near two seconds", () => {
    // `open photoCropper` in HU is ~2,100 characters over ~20 lines.
    const lines = Array.from({ length: 20 }, () => "x".repeat(105));
    const ms = total(lines, REVEAL);
    expect(ms).toBeGreaterThan(1500);
    expect(ms).toBeLessThan(2600);
  });

  it("with the shipped defaults types the card in about the old stagger's time", () => {
    const card = [
      "Zsolt Varjú",
      "Solving problems for a living.",
      "Software Developer · full-stack + platform operator",
      "sole developer on a project for the European Space Agency",
      "Prague, CET · EN · SK · HU · since 2022",
      "TypeScript · React · Next.js · Node.js · Python · Docker · Kubernetes",
      "always open to possibilities [contact] [cv ↓]",
    ];
    expect(total(card, REVEAL)).toBeCloseTo(REVEAL.budgetMs);
  });
});
