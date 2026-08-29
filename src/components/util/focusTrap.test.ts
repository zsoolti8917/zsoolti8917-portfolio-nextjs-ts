import { describe, expect, it } from "vitest";
import { trapStop } from "./focusTrap";

/**
 * The pure half of the dialog focus trap: given how many focusable stops the
 * dialog has and where focus is now, which stop does Tab move to. Kept out of
 * the component so the wrap-around — the part that actually makes it a trap —
 * is testable without a DOM.
 */
describe("trapStop", () => {
  it("goes to the next stop", () => {
    expect(trapStop(4, 1, false)).toBe(2);
  });

  it("goes to the previous stop on Shift+Tab", () => {
    expect(trapStop(4, 2, true)).toBe(1);
  });

  it("wraps from the last stop back to the first", () => {
    expect(trapStop(4, 3, false)).toBe(0);
  });

  it("wraps from the first stop back to the last", () => {
    expect(trapStop(4, 0, true)).toBe(3);
  });

  it("pulls focus in at the top when it is somewhere outside the dialog", () => {
    expect(trapStop(4, -1, false)).toBe(0);
  });

  it("pulls focus in at the bottom on Shift+Tab from outside", () => {
    expect(trapStop(4, -1, true)).toBe(3);
  });

  it("stays put when the dialog has a single stop", () => {
    expect(trapStop(1, 0, false)).toBe(0);
    expect(trapStop(1, 0, true)).toBe(0);
  });

  it("reports no stop at all when the dialog has none to offer", () => {
    expect(trapStop(0, -1, false)).toBe(-1);
    expect(trapStop(0, -1, true)).toBe(-1);
  });
});
