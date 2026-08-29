import { FiSearch } from "react-icons/fi";
import { TerminalPageLink, type TerminalState } from "../../terminal/parts";
import type { HeroTerminalCopy } from "../../types";
import { PaletteList } from "./PaletteList";
import { usePalette } from "./usePalette";

/**
 * The search card — T3's whole thesis.
 *
 * A prompt asks the visitor to recall a command. A palette asks her to
 * recognise one: at rest it is showing every question it can answer, in plain
 * English, and typing filters that list instead of risking "command not
 * found". So the input sits on TOP and the output below it, the inverse of the
 * default assembly, because here the input is a search box and not a prompt.
 */
export const PaletteCard = ({
  term, copy, className = "",
}: { term: TerminalState; copy: HeroTerminalCopy; className?: string }) => {
  const palette = usePalette(term, copy);
  const { open, activeRow, listId, captionId } = palette;

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 shadow-2xl shadow-black/40 ${className}`}
    >
      <div className="flex items-center gap-3 px-4 py-4 sm:gap-4 sm:px-5 sm:py-5">
        <FiSearch aria-hidden className="h-5 w-5 shrink-0 text-zinc-500" />
        <label className="min-w-0 flex-1">
          <span className="sr-only">{copy.inputLabel}</span>
          <input
            ref={term.inputRef}
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            // Names the active row without ever moving DOM focus off the input.
            aria-activedescendant={open && activeRow ? activeRow.id : undefined}
            value={term.value}
            onChange={palette.onChange}
            onKeyDown={palette.onKeyDown}
            onFocus={palette.onFocus}
            placeholder={copy.searchPlaceholder}
            // text-base keeps iOS from zooming the page on focus.
            className="w-full bg-transparent text-base text-zinc-100 caret-indigo-400 outline-none placeholder:text-zinc-500 sm:text-lg"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="go"
          />
        </label>
      </div>

      {/*
        No `onBlur` closing this: the list is the site's navigation here, not a
        transient popup, so clicking away must not delete the only visible
        answer to "what can I ask?" — nor reflow the page under the click.
        Escape closes it, which is also how the arrow keys get handed back to
        the shell's own command history.
      */}
      {open && (
        <div className="border-t border-zinc-800">
          <p id={captionId} className="px-4 pb-1 pt-3 text-[11px] text-zinc-500 sm:px-5">
            {copy.help.intro}
          </p>
          <PaletteList palette={palette} />
        </div>
      )}

      <div className="flex items-center gap-3 border-t border-zinc-800/70 px-4 py-2.5 sm:px-5">
        <span className="text-[11px] text-zinc-500">{copy.hintClick}</span>
        <span className="ml-auto">
          <TerminalPageLink copy={copy} />
        </span>
      </div>
    </div>
  );
};
