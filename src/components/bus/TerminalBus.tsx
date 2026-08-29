import React, {
  createContext, useCallback, useContext, useMemo, useRef, useState,
} from "react";

type Runner = (cmd: string) => void;

export interface TerminalBus {
  /** Scroll the hero into view and run `cmd` in the terminal. */
  run: (cmd: string) => void;
  /** The terminal registers its runner in an effect; returns an unregister fn. */
  register: (runner: Runner) => () => void;
  openProject: (key: string) => void;
  closeProject: () => void;
  projectKey: string | null;
  openPalette: () => void;
  closePalette: () => void;
  paletteOpen: boolean;
}

const TerminalBusContext = createContext<TerminalBus | null>(null);

/**
 * The single shared interface between the hero, the ⌘K palette and the
 * sections. Everything crossing those boundaries goes through here, so no
 * component needs to import another's internals — the palette can run a
 * terminal command and open a project modal knowing only these six names.
 *
 * The runner lives in a ref, not in state: registering it must not re-render
 * the whole tree, and there is only ever one terminal on the page.
 */
export const TerminalBusProvider = ({ children }: { children: React.ReactNode }) => {
  const runnerRef = useRef<Runner | null>(null);
  const [projectKey, setProjectKey] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const register = useCallback((runner: Runner) => {
    runnerRef.current = runner;
    return () => {
      // Guard against a remount having already installed a newer runner.
      if (runnerRef.current === runner) runnerRef.current = null;
    };
  }, []);

  const run = useCallback((cmd: string) => {
    // Scroll first: the command's output is worthless off-screen. Focusing the
    // input is the runner's job — it owns the element.
    document.getElementById("hero")?.scrollIntoView({ block: "start" });
    runnerRef.current?.(cmd);
  }, []);

  const value = useMemo<TerminalBus>(
    () => ({
      run,
      register,
      openProject: (key: string) => setProjectKey(key),
      closeProject: () => setProjectKey(null),
      projectKey,
      openPalette: () => setPaletteOpen(true),
      closePalette: () => setPaletteOpen(false),
      paletteOpen,
    }),
    [run, register, projectKey, paletteOpen]
  );

  return (
    <TerminalBusContext.Provider value={value}>{children}</TerminalBusContext.Provider>
  );
};

export const useTerminalBus = (): TerminalBus => {
  const ctx = useContext(TerminalBusContext);
  if (!ctx) {
    throw new Error("useTerminalBus must be used inside <TerminalBusProvider>");
  }
  return ctx;
};
