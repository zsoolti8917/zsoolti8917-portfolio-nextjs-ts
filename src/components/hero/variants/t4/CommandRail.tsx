import { COMMANDS } from "../../terminal/commands";
import type { TerminalState } from "../../terminal/parts";
import type { HeroTerminalCopy } from "../../types";
import { RAIL_HELP_KEY, RAIL_LABEL, type RailCommand } from "./rail";

/**
 * The whole point of T4.
 *
 * "I don't know what I can type" is the failure that kills a terminal
 * portfolio, and the fix is not a better hint — it is removing the question.
 * Every verb the shell understands is on screen, labelled in plain English,
 * permanently. Nothing here is inside the scrollback, so `clear` cannot strand
 * the visitor and long output cannot push the verbs off the top.
 *
 * Layout is one CSS switch, never a JSX branch on a capability value:
 *   - < md: a compact grid of chips above the output, names only.
 *   - >= md: a docs-style rail beside it, name + description per row.
 */
export const CommandRail = ({
  term,
  copy,
  active,
  className = "",
}: {
  term: TerminalState;
  copy: HeroTerminalCopy;
  active: RailCommand | null;
  className?: string;
}) => {
  const pick = (cmd: RailCommand) => {
    if (cmd === "find") {
      // A button cannot supply the word, so do the next best thing: print the
      // usage line into the log AND hand back a prompt already half-typed.
      term.run("find");
      term.setValue("find ");
      term.inputRef.current?.focus({ preventScroll: true });
      return;
    }
    term.run(cmd);
  };

  return (
    <nav
      aria-label={copy.help.intro}
      className={`min-h-0 border-b border-zinc-800 p-3 md:overflow-y-auto md:border-b-0 md:border-r md:p-4 ${className}`}
    >
      <p className="mb-2 text-[11px] leading-snug text-zinc-500">{copy.hintClick}</p>

      <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:flex md:flex-col md:gap-0.5">
        {COMMANDS.map((cmd) => {
          const isActive = active === cmd;
          return (
            <li key={cmd}>
              <button
                type="button"
                onClick={() => pick(cmd)}
                aria-current={isActive ? "true" : undefined}
                className={`w-full rounded border px-2.5 py-1.5 text-left transition-colors md:px-3 md:py-1 ${
                  isActive
                    ? "border-indigo-500/60 bg-indigo-500/10 text-indigo-200"
                    : "border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-indigo-500/60 hover:text-indigo-300"
                }`}
              >
                <span className="block truncate text-xs md:text-[13px]">
                  {RAIL_LABEL[cmd] ?? cmd}
                </span>
                {/* Hidden on phones, where the grid has to stay thumb-sized. */}
                <span className="hidden text-[11px] leading-tight text-zinc-500 md:block">
                  {copy.help[RAIL_HELP_KEY[cmd]]}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
