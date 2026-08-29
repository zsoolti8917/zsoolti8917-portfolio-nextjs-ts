import type { TerminalState } from "../../terminal/parts";
import { FileIcon } from "./FileIcon";
import type { HeroFile } from "./files";

/**
 * The open-files strip. On a phone the tree is gone and this is the entire
 * visible route set, so it carries CHIPS in full and scrolls sideways rather
 * than wrapping — a tab row that reflows into three lines stops reading as an
 * editor and starts reading as a menu.
 */
export const TabBar = ({
  term,
  tabs,
  active,
}: {
  term: TerminalState;
  tabs: HeroFile[];
  active: string | null;
}) => (
  <div className="flex shrink-0 overflow-x-auto border-b border-zinc-800 bg-zinc-950/40">
    {tabs.map((file) => {
      const isActive = active === file.cmd;
      return (
        <button
          key={file.cmd}
          type="button"
          title={file.hint}
          aria-current={isActive ? "page" : undefined}
          onClick={() => term.run(file.cmd)}
          className={`flex shrink-0 items-center gap-1.5 border-r border-t-2 border-r-zinc-800/80 px-3 py-1.5 text-[12px] transition-colors focus-visible:outline focus-visible:outline-indigo-400 focus-visible:outline-offset-[-2px] ${
            isActive
              ? "border-t-indigo-500 bg-zinc-900 text-zinc-100"
              : "border-t-transparent text-zinc-500 hover:bg-zinc-900/60 hover:text-zinc-300"
          }`}
        >
          <FileIcon kind={file.kind} className={isActive ? "text-indigo-400" : "text-zinc-600"} />
          <span>{file.name}</span>
        </button>
      );
    })}
  </div>
);
