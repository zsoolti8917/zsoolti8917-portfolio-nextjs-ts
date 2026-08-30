/**
 * The pacing of typed-out output.
 *
 * A real terminal dumps a frame at once; printing it character by character is
 * a pacing device, not a simulation, and the one rule for a pacing device is
 * that it must never cost the reader time. Adults read ~20 chars/s, and the
 * longest block the shell prints is ~2,100 characters — at any fixed
 * "typewriter" rate that is 30 seconds of waiting. So a block gets a DURATION
 * BUDGET, not a speed: short output visibly types, long output floods, and both
 * finish about when the old per-line stagger did. A cps floor keeps a
 * three-line error from flashing past; a cps ceiling keeps the worst block
 * honest at about two seconds.
 *
 * Pure, so the property can be asserted without a DOM. The hook that paints it
 * lives in `useTypeReveal`.
 */
export interface RevealOptions {
  /** What a block should take, when the clamp allows it. */
  budgetMs: number;
  /** Slowest allowed average, in characters per second. */
  minCps: number;
  /** Fastest allowed average. */
  maxCps: number;
  /** The beat at the end of a line — what reads as "a new line". */
  lineBreakMs: number;
  /** Only the first N lines get the beat; a long list must not stutter. */
  maxPausedLines: number;
}

export const REVEAL: RevealOptions = {
  budgetMs: 1100,
  minCps: 80,
  maxCps: 1000,
  lineBreakMs: 40,
  maxPausedLines: 12,
};

/**
 * Relative time a character takes. Sentence punctuation gets the longest beat,
 * clause punctuation a shorter one. Weights REDISTRIBUTE the budget; they never
 * add to it.
 */
export const weight = (ch: string): number =>
  ".!?:".includes(ch) ? 7 : ",;·—".includes(ch) ? 4 : 1;

export interface RevealSchedule {
  /** `time[k]` is when character `k` appears; `time[total]` is when the block is done. */
  time: Float64Array;
  /** Characters across all lines. */
  total: number;
}

/** When each character of a block appears, given the text of its lines. */
export const revealSchedule = (
  lines: readonly string[],
  opts: RevealOptions = REVEAL
): RevealSchedule => {
  // UTF-16 code units, not code points: that is the unit `Range.setStart`
  // takes, and the hook maps schedule index → node offset one to one.
  const chars = lines.join("").split("");
  const total = chars.length;
  const time = new Float64Array(total + 1);
  if (!total) return { time, total };

  // Which character indices end a paused line.
  const lineEnd = new Set<number>();
  let seen = 0;
  let paused = 0;
  for (const line of lines) {
    const n = line.length;
    if (!n) continue;
    seen += n;
    if (paused < opts.maxPausedLines) {
      lineEnd.add(seen - 1);
      paused += 1;
    }
  }

  const weights = chars.map(weight);
  const W = weights.reduce((a, b) => a + b, 0);
  const forChars = opts.budgetMs - paused * opts.lineBreakMs;
  const perW = Math.min(1000 / opts.minCps, Math.max(1000 / opts.maxCps, forChars / W));

  let acc = 0;
  for (let k = 0; k < total; k += 1) {
    time[k] = acc;
    acc += weights[k] * perW + (lineEnd.has(k) ? opts.lineBreakMs : 0);
  }
  time[total] = acc;
  return { time, total };
};
