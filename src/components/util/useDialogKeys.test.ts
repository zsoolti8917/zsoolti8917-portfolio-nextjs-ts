import { describe, expect, it } from "vitest";
import { createDialogStack } from "./useDialogKeys";

/**
 * `createDialogStack` is the pure half of `useDialogKeys` — the rule that
 * only the most recently opened dialog handles Escape. Covered here as plain
 * data so the stacking behaviour is testable without mounting React or
 * dispatching DOM events.
 */
describe("createDialogStack", () => {
  it("has no top before anything is pushed", () => {
    const stack = createDialogStack();
    expect(stack.isTop(Symbol("a"))).toBe(false);
  });

  it("the only open dialog is on top", () => {
    const stack = createDialogStack();
    const a = Symbol("a");
    stack.push(a);
    expect(stack.isTop(a)).toBe(true);
  });

  it("a dialog opened on top of another becomes the top; the older steps aside", () => {
    const stack = createDialogStack();
    const modal = Symbol("modal");
    const palette = Symbol("palette");
    stack.push(modal);
    stack.push(palette);

    expect(stack.isTop(palette)).toBe(true);
    expect(stack.isTop(modal)).toBe(false);
  });

  it("closing the top reveals the one beneath it", () => {
    const stack = createDialogStack();
    const modal = Symbol("modal");
    const palette = Symbol("palette");
    stack.push(modal);
    stack.push(palette);

    stack.remove(palette);

    expect(stack.isTop(modal)).toBe(true);
  });

  it("removing a dialog that is not on top leaves the top unchanged", () => {
    const stack = createDialogStack();
    const modal = Symbol("modal");
    const palette = Symbol("palette");
    stack.push(modal);
    stack.push(palette);

    stack.remove(modal);

    expect(stack.isTop(palette)).toBe(true);
  });

  it("is empty again once every dialog has closed", () => {
    const stack = createDialogStack();
    const a = Symbol("a");
    stack.push(a);
    stack.remove(a);

    expect(stack.isTop(a)).toBe(false);
  });
});
