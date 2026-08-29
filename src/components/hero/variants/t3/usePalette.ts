import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { TerminalState } from "../../terminal/parts";
import type { HeroTerminalCopy } from "../../types";
import { buildRows, hasArgument, type PaletteRow } from "./rows";

/**
 * The combobox layer on top of `useTerminal`.
 *
 * The engine is untouched: this owns only which rows are showing, which one is
 * active, and the key routing between the two. Everything that actually runs
 * still goes through `term.run`.
 */
export const usePalette = (term: TerminalState, copy: HeroTerminalCopy) => {
  const baseId = useId();
  const listId = `${baseId}list`;
  const captionId = `${baseId}caption`;

  /**
   * Open on the server and on the first paint, before anything is focused:
   * the visible list of everything you can ask for is the entire reason this
   * variant exists, so it is the resting state, not a focus reward. It is
   * plain state — no capability value — so SSR and hydration provably agree.
   */
  const [open, setOpen] = useState(true);
  const [active, setActive] = useState(0);

  const listRef = useRef<HTMLUListElement>(null);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);

  const rows = useMemo(
    () => buildRows(copy.help, term.value, baseId),
    [copy.help, term.value, baseId]
  );

  // Derived, not synced: a shrinking list can never leave a stale index behind.
  const activeIndex = rows.length ? Math.min(active, rows.length - 1) : -1;
  const activeRow: PaletteRow | null = activeIndex >= 0 ? rows[activeIndex] : null;

  /**
   * Browsers do not scroll the active option into view for you — DOM focus
   * never moves, so there is nothing for them to follow. Done by hand rather
   * than with `scrollIntoView({ block: "nearest" })`, which also scrolls every
   * ancestor and drags the whole page on a phone. Only this box may move.
   */
  useEffect(() => {
    if (!open) return;
    const box = listRef.current;
    const el = optionRefs.current[activeIndex];
    if (!box || !el) return;

    const top = el.offsetTop;
    const bottom = top + el.offsetHeight;
    if (top < box.scrollTop) box.scrollTop = top;
    else if (bottom > box.scrollTop + box.clientHeight) {
      box.scrollTop = bottom - box.clientHeight;
    }
  }, [activeIndex, open, rows.length]);

  const choose = useCallback(
    (row: PaletteRow) => {
      term.stopDemo();
      setActive(0);
      setOpen(true);

      // With an argument typed (`find docker`), the row is only confirming the
      // first word — running the bare command would throw the query away, so
      // clicking a row does exactly what pressing Enter on it does.
      const typed = term.value.trim();
      if (hasArgument(typed) && typed.split(/\s+/)[0].toLowerCase() === row.command) {
        term.run(typed);
        return;
      }

      // `find` needs a word before it can answer, so choosing it prefills the
      // command and asks for one — and that is the one case where the caret
      // has to be moved to the input, because we just made typing mandatory.
      // Choosing it a second time, with the prefill already sitting there,
      // runs it and gets the usage line rather than doing nothing.
      const prefilled = `${row.command} `;
      if (row.prefill && term.value !== prefilled) {
        term.setValue(prefilled);
        term.inputRef.current?.focus({ preventScroll: true });
        return;
      }
      term.run(row.command);
    },
    [term]
  );

  const move = useCallback(
    (delta: number) => {
      if (!rows.length) return;
      setActive((i) => {
        const from = Math.min(i, rows.length - 1);
        return (from + delta + rows.length) % rows.length;
      });
    },
    [rows.length]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      /**
       * THE ARROW-KEY CONFLICT.
       *
       * `useTerminal.onKeyDown` binds ArrowUp/ArrowDown to shell history. In a
       * combobox those keys belong to the list, so they are intercepted here
       * FIRST and only fall through to the engine while the list is closed.
       * That is also why Escape closes the list instead of clearing the input:
       * closing it is how a keyboard user hands the arrows back to history.
       * Every other key — Enter with an argument typed, Ctrl+L — is delegated
       * untouched, so there is only one implementation of any of them.
       */
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        if (open && rows.length) {
          e.preventDefault();
          term.stopDemo();
          move(e.key === "ArrowDown" ? 1 : -1);
          return;
        }
        if (e.key === "ArrowDown") {
          e.preventDefault();
          term.stopDemo();
          setActive(0);
          setOpen(true);
          return;
        }
        // Closed + ArrowUp: history. Fall through to the engine.
      }

      if (e.key === "Enter") {
        // A typed argument (`find docker`) is more specific than the row it
        // matched, so it wins; the engine runs the raw text.
        if (open && activeRow && !hasArgument(term.value)) {
          e.preventDefault();
          choose(activeRow);
          return;
        }
        setActive(0);
      }

      if (e.key === "Escape") {
        // The engine has no Escape binding, so this never needs delegating.
        e.preventDefault();
        if (open) setOpen(false);
        else if (term.value) {
          term.stopDemo();
          term.setValue("");
        }
        return;
      }

      /**
       * The engine completes ghost text on ArrowRight. This variant declares
       * `aria-autocomplete="list"` and draws no ghost — the list is the
       * completion — so ArrowRight is left to move the caret and nothing else.
       */
      if (e.key === "ArrowRight") return;

      term.onKeyDown(e);
    },
    [activeRow, choose, move, open, rows.length, term]
  );

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      term.stopDemo();
      term.setValue(e.target.value);
      setActive(0);
      setOpen(true);
    },
    [term]
  );

  const onFocus = useCallback(() => setOpen(true), []);

  return {
    listId, captionId, open, rows, activeIndex, activeRow,
    listRef, optionRefs, setActive, choose, onKeyDown, onChange, onFocus,
  };
};
