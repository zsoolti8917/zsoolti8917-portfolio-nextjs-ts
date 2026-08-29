import { useMemo } from "react";
import {
  VscFileCode, VscFiles, VscSearch, VscSourceControl,
} from "react-icons/vsc";
import { recursiveMono } from "../fonts";
import { HeroActions } from "../parts/HeroActions";
import { HeroContainer } from "../parts/HeroContainer";
import { HeroSection } from "../parts/HeroSection";
import { ReadableBand } from "../parts/ReadableBand";
import { useHeroCopy } from "../parts/useHeroCopy";
import { TerminalPageLink, TerminalShell, TerminalSkipLink } from "../terminal/parts";
import { useTerminal } from "../terminal/useTerminal";
import { useTerminalData } from "../terminal/useTerminalData";
import { DockedPanel } from "./t5/DockedPanel";
import { EditorBuffer } from "./t5/EditorBuffer";
import { FileTree } from "./t5/FileTree";
import { TabBar } from "./t5/TabBar";
import { activeCommand, buildFiles, tabFiles } from "./t5/files";

/**
 * T5 — IDE frame.
 *
 * The variant that serves both audiences at once. A recruiter gets the name,
 * the role and the summary in large plain type before the frame starts, then a
 * document pane with a list of sections down the left — a shape they already
 * know from every file manager they have ever used. A developer gets their own
 * editor: activity rail, tree, tabs, a line-number gutter, and the terminal
 * docked underneath where it lives.
 *
 * Both audiences are driving the SAME shell. The tree and the tabs run
 * commands; the prompt runs commands; the links inside the output run
 * commands. There is no second navigation model to keep in sync — the
 * highlighted tab is derived from whatever the log last echoed.
 */
export const HeroT5 = () => {
  const { common, terminal, copy } = useHeroCopy(5);
  const term = useTerminal(terminal);
  const { projects } = useTerminalData();

  const files = useMemo(() => buildFiles(terminal), [terminal]);
  const tabs = useMemo(() => tabFiles(files), [files]);
  const active = activeCommand(term.blocks);

  return (
    <HeroSection>
      <HeroContainer>
        {/* First focusable on the page: out before the frame, not inside it. */}
        <TerminalSkipLink copy={terminal} />

        <ReadableBand common={common} copy={copy} />

        <TerminalShell
          className={`${recursiveMono.variable} mt-10 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900`}
        >
          {/* Title bar. */}
          <div className="flex shrink-0 items-center gap-2 border-b border-zinc-800 bg-zinc-950/70 px-3 py-2">
            <VscFileCode aria-hidden className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
            <span className="truncate text-xs text-zinc-500">{terminal.windowTitle}</span>
            <span className="ml-auto pl-3">
              <TerminalPageLink copy={terminal} />
            </span>
          </div>

          <div className="flex min-h-0 flex-1">
            {/* Activity rail — chrome only, so it is hidden from assistive tech
                and takes no clicks. Every route it could imply already has a
                labelled row in the tree beside it. */}
            <div
              aria-hidden
              className="hidden w-10 shrink-0 flex-col items-center gap-4 border-r border-zinc-800 bg-zinc-950 py-3 md:flex"
            >
              <VscFiles className="h-4 w-4 text-indigo-400" />
              <VscSearch className="h-4 w-4 text-zinc-700" />
              <VscSourceControl className="h-4 w-4 text-zinc-700" />
            </div>

            <FileTree
              term={term}
              copy={terminal}
              files={files}
              projects={projects}
              active={active}
            />

            <div className="flex min-w-0 flex-1 flex-col">
              <TabBar term={term} tabs={tabs} active={active} />
              <EditorBuffer term={term} copy={terminal} />
              <DockedPanel term={term} copy={terminal} />
            </div>
          </div>
        </TerminalShell>

        <HeroActions common={common} />
      </HeroContainer>
    </HeroSection>
  );
};
