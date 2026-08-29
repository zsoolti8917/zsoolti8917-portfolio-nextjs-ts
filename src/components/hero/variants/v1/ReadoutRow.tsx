import { useRef } from "react";
import { useCountUp } from "../../parts/useCountUp";

interface Props {
  label: string;
  /** A number counts up; a string (the build date) is printed verbatim. */
  value: number | string;
  animate: boolean;
  delayMs: number;
}

/**
 * One line of telemetry. The value is server-rendered at its final state and
 * `useCountUp` only replaces it after mount, so this row is correct with no
 * JS, correct under reduced motion, and never a hydration mismatch.
 *
 * The build date deliberately takes the string branch: it is already
 * YYYY-MM-DD and must never be run through toLocaleDateString().
 */
export const ReadoutRow = ({ label, value, animate, delayMs }: Props) => {
  const ref = useRef<HTMLSpanElement>(null);
  const numeric = typeof value === "number";

  useCountUp(ref, numeric ? value : 0, {
    enabled: animate && numeric,
    delayMs,
  });

  return (
    <div className="group flex items-baseline justify-between gap-3 border-b border-zinc-800/80 py-2 last:border-b-0">
      <dt className="min-w-0 text-[11px] leading-snug text-zinc-500">
        <span className="mr-2 inline-block h-1 w-1 translate-y-[-2px] rounded-full bg-zinc-700 transition-colors group-hover:bg-indigo-500" />
        {label}
      </dt>
      <dd
        className={
          numeric
            ? "shrink-0 text-lg font-black leading-none tabular-nums text-zinc-100"
            : "shrink-0 text-xs font-bold leading-none tabular-nums text-zinc-400"
        }
      >
        <span ref={ref}>{value}</span>
      </dd>
    </div>
  );
};
