import { CSSProperties, Fragment, useMemo, useRef } from "react";
import { useMotionCapabilities } from "../../hooks/useMotionCapabilities";
import { fallbackWeightClass, splitHeadline } from "./kineticType";
import { useKineticType } from "./useKineticType";

/**
 * The headline, server-rendered as finished editorial type.
 *
 * Structure, in order of how load-bearing it is:
 *
 * 1. Words are wrapped before letters are. A bare string→letters split makes
 *    every glyph an independent break opportunity, so `Űrügynökség` shatters
 *    mid-word. The word wrapper is `inline-block`, which is also the reason a
 *    word longer than the column can never overflow: shrink-to-fit caps it at
 *    the container width and it wraps internally instead.
 * 2. The space between words is a real text node, outside the word boxes, so it
 *    stays a break opportunity and the copy still reads as words to anything
 *    that walks the DOM.
 * 3. `aria-label` carries the sentence; every decorative span is hidden. A
 *    screen reader gets one heading, not fifty letters.
 * 4. `--hw` is inline from the server. Nothing here waits for JS: the type
 *    already has its weight gradient in the initial HTML, and the effect only
 *    modulates a value that is already there.
 */
export const KineticHeadline = ({ lines }: { lines: string[] }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const { mounted, reducedMotion, coarsePointer } = useMotionCapabilities();

  // The copy itself is the identity: `t.raw` hands back a fresh array on every
  // render, so memoising on the reference would rebuild the split every time
  // and hand the loop a new `bases` — which would re-measure every time too.
  const replayKey = lines.join("\n");
  const split = useMemo(() => splitHeadline(lines), [replayKey]);

  useKineticType({
    rootRef,
    bases: split.bases,
    // Capability values gate the effect, never the markup below.
    enabled: mounted && !reducedMotion,
    proximity: mounted && !reducedMotion && !coarsePointer,
    replayKey,
  });

  const lastIndex = split.lines.length - 1;

  return (
    <div ref={rootRef} className="relative">
      {/*
        Keyed on the copy: a language switch throws the whole subtree away
        rather than re-using spans that still carry the previous language's
        frozen `width`. It also re-arms the intro wave, so the headline
        re-animates on a locale change the way `util/Reveal` does everywhere
        else on the page.
      */}
      <h1
        key={replayKey}
        aria-label={lines.join(" ")}
        className="text-[length:clamp(2.25rem,8vw,5rem)] uppercase leading-[0.95] tracking-[-0.03em] text-zinc-100"
      >
        {split.lines.map((line, li) => {
          // One object per line, not per letter: React never mutates it.
          const style = { "--hw": String(line.base) } as CSSProperties;

          return (
            <span
              key={li}
              aria-hidden="true"
              className={`block ${fallbackWeightClass(line.base)} ${
                li === lastIndex ? "text-indigo-500" : ""
              }`}
            >
              {line.words.map((word, wi) => (
                <Fragment key={wi}>
                  {wi > 0 ? " " : null}
                  <span className="inline-block">
                    {word.map((char, ci) => (
                      <span key={ci} className="hero-kinetic-letter" style={style}>
                        {char}
                      </span>
                    ))}
                  </span>
                </Fragment>
              ))}
            </span>
          );
        })}
      </h1>
    </div>
  );
};
