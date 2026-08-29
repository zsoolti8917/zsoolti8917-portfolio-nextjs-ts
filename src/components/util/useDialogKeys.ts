import { useEffect, useRef } from "react";

interface Options {
  open: boolean;
  onClose: () => void;
}

/**
 * Escape-to-close plus focus return for dialogs (project modal, ⌘K palette).
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

    const opener = document.activeElement as HTMLElement | null;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Capture phase + stopImmediatePropagation: pre-empts any other
        // Escape handler (e.g. a nested dialog) reached later in this phase.
        e.stopImmediatePropagation();
        onCloseRef.current();
      }
    };

    document.addEventListener("keydown", onKeyDown, { capture: true });
    return () => {
      document.removeEventListener("keydown", onKeyDown, { capture: true });
      opener?.focus?.();
    };
  }, [open]);
};
