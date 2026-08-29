import { useRef } from "react";
import { Chip } from "@/components/util/Chip";
import { useInViewActive } from "../../hooks/useInViewActive";
import { useMotionCapabilities } from "../../hooks/useMotionCapabilities";
import { CHIP_ATTR, useRagdoll } from "./useRagdoll";

interface Props {
  items: string[];
  hint: string;
  resetLabel: string;
}

/**
 * The pile.
 *
 * What the server renders — a wrapping list of real `<span>` chips — is also
 * what a phone, a reduced-motion visitor and a no-JS visitor keep. The physics
 * layer never swaps that markup out; it takes the very same elements absolute
 * and writes a transform per frame. `canRunPhysics` therefore appears nowhere
 * in this JSX: it is handed to `useRagdoll` and read inside its effect.
 *
 * The container is its own `z-0` layer, strictly below the `z-10` text block,
 * and sits under the CTAs rather than over them — `MouseConstraint` binds
 * mousedown to this element and would otherwise be sitting on the buttons.
 */
export const ChipLayer = ({ items, hint, resetLabel }: Props) => {
  const { canRunPhysics } = useMotionCapabilities();
  const containerRef = useRef<HTMLDivElement>(null);
  const active = useInViewActive(containerRef);
  const { live, reset } = useRagdoll({
    containerRef,
    enabled: canRunPhysics,
    active,
  });

  return (
    <>
      {/* Height is reserved unconditionally so revealing the controls costs no
          layout shift. `live` is set inside the effect, so the server and the
          first client render agree that it is false. */}
      <div className="mt-8 flex h-7 items-center gap-3">
        {live && (
          <>
            <span className="text-xs text-zinc-500">{hint}</span>
            <button
              type="button"
              onClick={reset}
              className="rounded border border-zinc-800 px-2 py-1 text-xs text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-200"
            >
              {resetLabel}
            </button>
          </>
        )}
      </div>

      <div
        ref={containerRef}
        className="relative z-0 mt-2 flex flex-wrap content-end gap-2 overflow-hidden md:min-h-[340px]"
      >
        {items.map((item) => (
          <span
            key={item}
            {...{ [CHIP_ATTR]: "" }}
            className={`inline-flex ${
              live ? "cursor-grab select-none active:cursor-grabbing" : ""
            }`}
          >
            <Chip>{item}</Chip>
          </span>
        ))}
      </div>
    </>
  );
};
