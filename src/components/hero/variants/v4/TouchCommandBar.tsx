interface Props {
  commands: string[];
  onRun: (cmd: string) => void;
  className?: string;
}

/**
 * The escape hatch for fingers. Rendered unconditionally and hidden with
 * `md:hidden` by the caller — branching on `coarsePointer` would be a JSX
 * branch on a capability value, which is the one thing these variants can't do.
 *
 * Tapping a chip runs the command WITHOUT focusing the input, so the virtual
 * keyboard never opens unless the visitor asks for it.
 */
export const TouchCommandBar = ({ commands, onRun, className = "" }: Props) => (
  <div className={`mt-3 flex flex-wrap gap-2 border-t border-zinc-800 pt-3 ${className}`}>
    {commands.map((cmd) => (
      <button
        key={cmd}
        type="button"
        onClick={() => onRun(cmd)}
        className="rounded border border-zinc-700 bg-zinc-800/60 px-2 py-1 text-xs text-zinc-300 transition-colors hover:border-indigo-500 hover:text-indigo-300 active:bg-zinc-700"
      >
        {cmd}
      </button>
    ))}
  </div>
);
