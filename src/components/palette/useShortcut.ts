import { useEffect, useRef } from "react";

/**
 * Marks the palette's own input. `⌘K` is ignored while a field has focus —
 * that keystroke belongs to the field — but the palette's input is the one
 * place the shortcut still has to fire, so it can toggle the dialog shut.
 */
export const PALETTE_INPUT = "data-palette-input";

const isEditable = (el: HTMLElement | null) =>
  !!el &&
  (el.isContentEditable ||
    el.tagName === "INPUT" ||
    el.tagName === "TEXTAREA" ||
    el.tagName === "SELECT");

/**
 * `⌘K` on a Mac, `Ctrl+K` everywhere else — the two are not interchangeable:
 * `Ctrl+K` inside a macOS text field is "kill to end of line", and binding it
 * there would quietly break editing on the one platform that uses ⌘.
 */
export const useShortcut = (onTrigger: () => void) => {
  // In a ref so an inline arrow as the handler does not re-bind the listener.
  const onTriggerRef = useRef(onTrigger);
  onTriggerRef.current = onTrigger;

  useEffect(() => {
    // Read in the effect, never during render: `navigator` does not exist on
    // the server, and a platform guess that flips on hydration is a bug.
    const mac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "k") return;
      if (!(mac ? event.metaKey : event.ctrlKey)) return;

      const target = event.target as HTMLElement | null;
      if (isEditable(target) && !target?.hasAttribute(PALETTE_INPUT)) return;

      // Chrome's own ⌘K focuses the address bar; the page wins here.
      event.preventDefault();
      onTriggerRef.current();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
};
