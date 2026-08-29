import { useEffect, useRef } from "react";

interface Options {
  open: boolean;
  onClose: () => void;
}

/**
 * A minimal LIFO of open dialogs, pulled out as a pure helper so "only the
 * top handles Escape" can be unit-tested without mounting anything.
 */
export const createDialogStack = () => {
  const stack: symbol[] = [];

  return {
    push: (id: symbol) => {
      stack.push(id);
    },
    remove: (id: symbol) => {
      const i = stack.indexOf(id);
      if (i !== -1) stack.splice(i, 1);
    },
    isTop: (id: symbol) => stack.length > 0 && stack[stack.length - 1] === id,
  };
};

/** One stack, shared by every dialog on the page (project modal, ⌘K palette,
 * the locale menu). */
const dialogStack = createDialogStack();

/**
 * Escape-to-close plus focus return for dialogs (project modal, ⌘K palette).
 *
 * Every open dialog still registers its own document-capture keydown
 * listener, but each also pushes a token onto a module-level stack while it
 * is open and only acts on Escape while that token is on top. Capture
 * listeners fire in registration order (oldest first) regardless of stacking,
 * so without this an older dialog would see Escape before a newer one stacked
 * on top of it and close itself first. With the stack check, the older
 * listener finds it is no longer on top and steps aside — letting the event
 * reach the newer listener, which is on top and closes innermost-first.
 *
 * Returning focus to the element that opened the dialog is the part that is
 * easy to forget and impossible to work around: without it a keyboard user is
 * dumped at the top of the document every time they close something.
 */
export const useDialogKeys = ({ open, onClose }: Options) => {
  // Held in a ref so an inline arrow function as `onClose` does not re-bind
  // the listener on every render.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;

    const id = Symbol("dialog");
    const opener = document.activeElement as HTMLElement | null;

    dialogStack.push(id);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dialogStack.isTop(id)) {
        // Capture phase + stopImmediatePropagation: pre-empts any other
        // Escape handler (a dialog stacked below this one) reached later in
        // this phase.
        e.stopImmediatePropagation();
        onCloseRef.current();
      }
    };

    document.addEventListener("keydown", onKeyDown, { capture: true });
    return () => {
      document.removeEventListener("keydown", onKeyDown, { capture: true });
      dialogStack.remove(id);
      opener?.focus?.();
    };
  }, [open]);
};
