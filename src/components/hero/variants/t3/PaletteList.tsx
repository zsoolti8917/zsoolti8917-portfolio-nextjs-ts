import { chunkLabel, type PaletteRow } from "./rows";
import type { usePalette } from "./usePalette";

/**
 * The listbox.
 *
 * Rows are `<li role="option">`, never buttons: an option must not be
 * focusable, because DOM focus stays on the input and the active row is named
 * through `aria-activedescendant`. They are still independently clickable —
 * mobile screen readers ignore `aria-activedescendant` entirely, so a tap has
 * to work on its own.
 */
export const PaletteList = ({ palette }: { palette: ReturnType<typeof usePalette> }) => {
  const { rows, activeIndex, listId, captionId, listRef, optionRefs, setActive, choose } = palette;

  return (
    <ul
      id={listId}
      ref={listRef}
      role="listbox"
      aria-labelledby={captionId}
      // `relative`: the scroll maths in usePalette reads `offsetTop`, which is
      // only measured against this box if this box is the offset parent.
      // The height cap is what keeps the six a recruiter wants above the fold.
      className="relative max-h-[12.5rem] overflow-y-auto overscroll-contain py-1 sm:max-h-[14rem]"
    >
      {rows.map((row: PaletteRow, i) => {
        const isActive = i === activeIndex;
        return (
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events
          <li
            key={row.id}
            id={row.id}
            ref={(el) => {
              optionRefs.current[i] = el;
            }}
            role="option"
            aria-selected={isActive}
            // mousemove, not mouseenter: a list scrolling under a still cursor
            // must not steal the highlight from the keyboard.
            onMouseMove={() => setActive(i)}
            // Keeps DOM focus where it is — the input for a keyboard user, and
            // nowhere for a visitor who has only ever clicked, so a tap on a
            // phone does not pop the keyboard open.
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => choose(row)}
            className={`flex cursor-pointer flex-col gap-0.5 border-l-2 py-2 pl-3 pr-4 transition-colors sm:flex-row sm:items-baseline sm:gap-3 sm:pl-4 sm:pr-5 ${
              isActive
                ? "border-indigo-500 bg-indigo-500/10"
                : "border-transparent hover:bg-zinc-800/40"
            }`}
          >
            <span
              className={`shrink-0 text-[13px] sm:w-32 ${
                isActive ? "text-zinc-100" : "text-zinc-200"
              }`}
            >
              {chunkLabel(row.label, row.match).map((chunk, j) =>
                chunk.hit ? (
                  <mark key={j} className="bg-transparent font-semibold text-indigo-300">
                    {chunk.text}
                  </mark>
                ) : (
                  <span key={j}>{chunk.text}</span>
                )
              )}
            </span>
            <span className="min-w-0 text-xs text-zinc-400 sm:text-[13px]">
              {row.description}
            </span>
            <span
              aria-hidden
              className={`ml-auto hidden shrink-0 pl-3 text-[11px] text-indigo-300/80 sm:block ${
                isActive ? "" : "invisible"
              }`}
            >
              ↵
            </span>
          </li>
        );
      })}
    </ul>
  );
};
