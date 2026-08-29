import { useState } from "react";
import {
  VscChevronDown, VscChevronRight, VscFolder, VscFolderOpened, VscMarkdown,
} from "react-icons/vsc";
import type { TerminalState } from "../../terminal/parts";
import type { TerminalProject } from "../../terminal/useTerminalData";
import type { HeroTerminalCopy } from "../../types";
import { FileIcon } from "./FileIcon";
import { slug, type HeroFile } from "./files";

const ROW =
  "group flex w-full items-center gap-2 rounded-sm py-[3px] pr-2 text-left text-[12px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400";
const IDLE = "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200";
const ACTIVE = "bg-zinc-800/70 text-zinc-100";

/** The one icon that carries state: a folder knows whether it is open. */
const FolderIcon = ({ open, className }: { open: boolean; className: string }) => {
  const Icon = open ? VscFolderOpened : VscFolder;
  return <Icon aria-hidden className={`h-3.5 w-3.5 shrink-0 ${className}`} />;
};

/**
 * The sidebar IS the navigation.
 *
 * Every command the shell answers to has a row here, so a visitor who will
 * never type a character still has a labelled, visible route to all of it —
 * which is the reason this variant renders no chip row at all. The `title` on
 * each row carries the plain-English description from `hero.terminal.help`,
 * for anyone who does not read `.json` as "the list of things he builds with".
 *
 * Hidden below `md` with CSS, never with a JSX branch: the markup the server
 * sends is the markup every client hydrates.
 */
export const FileTree = ({
  term,
  copy,
  files,
  projects,
  active,
}: {
  term: TerminalState;
  copy: HeroTerminalCopy;
  files: HeroFile[];
  projects: TerminalProject[];
  active: string | null;
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="hidden w-56 shrink-0 flex-col overflow-y-auto border-r border-zinc-800 bg-zinc-950/50 px-2 py-2 md:flex">
      <ul>
        {files.map((file) => {
          const isActive = active === file.cmd;
          const isFolder = file.kind === "folder";

          return (
            <li key={file.cmd}>
              <button
                type="button"
                title={file.hint}
                aria-current={isActive ? "true" : undefined}
                aria-expanded={isFolder ? expanded : undefined}
                onClick={() => {
                  if (isFolder) setExpanded((open) => !open);
                  term.run(file.cmd);
                }}
                className={`${ROW} pl-1 ${isActive ? ACTIVE : IDLE}`}
              >
                {isFolder ? (
                  expanded ? (
                    <VscChevronDown aria-hidden className="h-3 w-3 shrink-0 text-zinc-500" />
                  ) : (
                    <VscChevronRight aria-hidden className="h-3 w-3 shrink-0 text-zinc-500" />
                  )
                ) : (
                  <span aria-hidden className="w-3 shrink-0" />
                )}
                {isFolder ? (
                  <FolderIcon
                    open={expanded}
                    className={isActive ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-400"}
                  />
                ) : (
                  <FileIcon
                    kind={file.kind}
                    className={isActive ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-400"}
                  />
                )}
                <span className="truncate">{file.name}</span>
              </button>

              {isFolder && expanded && (
                <ul className="ml-[13px] border-l border-zinc-800">
                  {projects.map((project) => (
                    <li key={project.key}>
                      <button
                        type="button"
                        title={copy.openHint}
                        onClick={() => term.run(`open ${project.key}`)}
                        className={`${ROW} pl-3 ${IDLE}`}
                      >
                        <VscMarkdown
                          aria-hidden
                          className="h-3.5 w-3.5 shrink-0 text-zinc-600 group-hover:text-zinc-500"
                        />
                        <span className="truncate">{`${slug(project.title)}.md`}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
