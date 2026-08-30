import { useEffect, useLayoutEffect, type RefObject } from "react";
import { REVEAL, revealSchedule, type RevealOptions } from "./reveal";
import type { RevealMode } from "./session";

/**
 * Types a block's output out — without ever changing its markup.
 *
 * The block is rendered complete, on the server and on the client alike; that
 * is what a crawler reads and what a screen reader announces, once, in full.
 * This hook then hides the not-yet-typed remainder with the CSS Custom
 * Highlight API — one `Range` from the write head to the end of the block,
 * painted `color: transparent` by `::highlight(term-untyped)` — and advances
 * the range's start every frame on the schedule `revealSchedule` computed.
 * Nothing in the DOM moves, so the box never grows and the page never jumps,
 * which is the one thing every typing hero on the web gets wrong.
 *
 * `data-reveal` on the root tells the CSS what state the block is in:
 *   "typing"  the highlight is live; the per-line stagger must stay out of it
 *   "done"    typed, or fast-forwarded; lines stay opaque
 *   "css"     the API is missing or the block will not be typed; fall back to
 *             the stagger (and, for the pre-run card, stop deferring it)
 *
 * Browsers without `CSS.highlights` (pre-2025 Firefox) get the stagger.
 */
const NAME = "term-untyped";

const supported = () =>
  typeof CSS !== "undefined" && "highlights" in CSS && typeof Highlight !== "undefined";

/** Before paint on the client, a no-op on the server (where there is no paint). */
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export interface TypeRevealArgs {
  mode: RevealMode;
  /** The scroll container to keep the write head inside, forward only. */
  follow?: RefObject<HTMLElement>;
  onStart?: () => void;
  onEnd?: () => void;
  options?: RevealOptions;
}

export const useTypeReveal = (
  ref: RefObject<HTMLElement>,
  { mode, follow, onStart, onEnd, options = REVEAL }: TypeRevealArgs
) => {
  useIsoLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (mode === "wait") return;
    if (mode === "settle" || !supported()) {
      // Never demote a block that has already been typed.
      if (!root.dataset.reveal) root.dataset.reveal = "css";
      return;
    }
    // No "already done" guard here: a block never goes back from "settle" to
    // "type", so the only way this runs on a finished block is React's dev-only
    // double invocation of effects — and then it must simply start over.

    // 1. Every text node of every line, in document order, with the schedule
    //    index at which each node starts. One pass.
    const lineEls = Array.from(root.querySelectorAll<HTMLElement>("[data-line]"));
    const nodes: Text[] = [];
    const starts: number[] = [];
    const lineOf: number[] = [];
    const texts: string[] = [];
    let total = 0;
    lineEls.forEach((line, li) => {
      let text = "";
      const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const t = n as Text;
        if (!t.data.length) continue;
        nodes.push(t);
        starts.push(total);
        lineOf.push(li);
        total += t.data.length;
        text += t.data;
      }
      texts.push(text);
    });
    if (!total) return;

    // 2. When each character appears.
    const { time } = revealSchedule(texts, options);

    // 3. One range from the head to the end. The highlight object is shared
    //    across blocks, so two reveals can overlap without fighting over the
    //    name.
    const last = nodes[nodes.length - 1];
    const range = new Range();
    range.setStart(nodes[0], 0);
    range.setEnd(last, last.data.length);
    const highlight = CSS.highlights.get(NAME) ?? new Highlight();
    highlight.add(range);
    CSS.highlights.set(NAME, highlight);
    root.dataset.reveal = "typing";
    onStart?.();

    let raf = 0;
    let head = 0;
    let node = 0;
    let line = -1;
    const t0 = performance.now();

    const finish = () => {
      cancelAnimationFrame(raf);
      highlight.delete(range);
      root.dataset.reveal = "done";
      onEnd?.();
    };

    // Keep the line being written inside the scroll container. Forward only:
    // a visitor who scrolled up to re-read something is left alone.
    const keepVisible = (el: HTMLElement) => {
      const box = follow?.current;
      if (!box) return;
      const bottom = el.getBoundingClientRect().bottom - box.getBoundingClientRect().top + box.scrollTop;
      const want = bottom + 16 - box.clientHeight;
      if (want > box.scrollTop) box.scrollTop = want;
    };

    const tick = (now: number) => {
      const t = now - t0;
      while (head < total && time[head + 1] <= t) head += 1;
      if (head >= total) return finish();
      while (node + 1 < nodes.length && starts[node + 1] <= head) node += 1;
      range.setStart(nodes[node], head - starts[node]);
      if (lineOf[node] !== line) {
        line = lineOf[node];
        keepVisible(lineEls[line]);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // Unmount, or the mode changing under a running reveal (a skip), finishes
    // it: the highlight goes, the text is simply there.
    return () => {
      if (root.dataset.reveal === "typing") finish();
    };
    // Callbacks are stable refs from useTerminal; options are a module constant.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, ref]);
};
