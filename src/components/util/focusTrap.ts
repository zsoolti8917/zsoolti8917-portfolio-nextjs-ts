/**
 * Tab containment for a dialog.
 *
 * `aria-modal="true"` is a promise to assistive technology that nothing behind
 * the dialog is reachable — but it changes no behaviour on its own. Without a
 * trap, Tab walks straight out into the nav that is still in the document, and
 * a keyboard user ends up operating a page they cannot see.
 */

/**
 * Which stop Tab moves to, as an index into the dialog's focusable elements in
 * DOM order. `current` is the index of the focused element, or -1 when focus is
 * outside the dialog; -1 comes back when there is nothing to focus at all.
 */
export const trapStop = (count: number, current: number, backwards: boolean): number => {
  if (count <= 0) return -1;
  // Focus outside the dialog enters at whichever end the direction implies.
  if (current < 0) return backwards ? count - 1 : 0;
  return (current + (backwards ? -1 : 1) + count) % count;
};

/**
 * Everything inside `root` that Tab would normally reach, in DOM order.
 * `offsetParent` is the cheap "is it actually rendered" test — it is null for
 * anything `display: none`, which would otherwise be handed focus silently.
 */
export const focusableStops = (root: HTMLElement | null): HTMLElement[] => {
  if (!root) return [];
  const selector =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), ' +
    'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(
    (el) => el.offsetParent !== null || el === document.activeElement
  );
};
