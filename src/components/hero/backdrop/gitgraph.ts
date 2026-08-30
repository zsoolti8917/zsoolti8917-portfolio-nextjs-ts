/**
 * The commit graph behind the hero window: a `git log --graph` read as a
 * texture. Pure — no DOM, no React, no clock, no `Math.random` — because it is
 * SERVER-RENDERED: the same seed must yield byte-identical markup on the server
 * and in the browser, or React reports a hydration mismatch and repaints.
 *
 * Every lane-group is an independent little repository: a main lane and up to
 * `LANES - 1` branch lanes. Time runs in "steps" (one commit each, absolute and
 * chronological); a row is derived from a step, so appending a commit changes
 * nothing about the commits already there — React keys stay stable and the
 * whole window shifts down by exactly one row.
 */

/** The one place for tuning. Alphas live in CSS (they are design tokens). */
export const GITGRAPH = {
  SEED: 0x2f6b1c3d,
  /** Main + branch lanes per group. */
  LANES: 3,
  /** Ring capacity = visible rows. 56 × 32px covers a 1440p-tall hero. */
  ROWS: 56,
  /** Extra steps at creation, so the window opens mid-history. */
  WARMUP: 64,
  /** Pixels per row — also the drift per cycle. */
  ROW: 32,
  LANE_PITCH: 28,
  PAD: 12,
  /** Group centres, in px from the section centre; mirrored to both sides. */
  OFFSETS: [616, 792, 968, 1144],
  /** One row of drift and one commit per group per cycle. */
  INTERVAL_MS: 15_000,
  /** Node radius. */
  R: 2.5,
  P_MERGE: 0.5,
  P_FORK: 0.18,
  P_BRANCH_COMMIT: 0.55,
  MIN_LEN: 2,
  MAX_LEN: 5,
} as const;

export interface GraphOptions {
  lanes: number;
  rows: number;
  warmup: number;
  pMerge: number;
  pFork: number;
  pBranchCommit: number;
  minLen: number;
  maxLen: number;
}

export const OPTS: GraphOptions = {
  lanes: GITGRAPH.LANES,
  rows: GITGRAPH.ROWS,
  warmup: GITGRAPH.WARMUP,
  pMerge: GITGRAPH.P_MERGE,
  pFork: GITGRAPH.P_FORK,
  pBranchCommit: GITGRAPH.P_BRANCH_COMMIT,
  minLen: GITGRAPH.MIN_LEN,
  maxLen: GITGRAPH.MAX_LEN,
};

export interface Metrics {
  row: number;
  lanePitch: number;
  pad: number;
  rows: number;
}

export const METRICS: Metrics = {
  row: GITGRAPH.ROW,
  lanePitch: GITGRAPH.LANE_PITCH,
  pad: GITGRAPH.PAD,
  rows: GITGRAPH.ROWS,
};

/** Width of one group's `<svg>`. */
export const GROUP_W = 2 * GITGRAPH.PAD + (GITGRAPH.LANES - 1) * GITGRAPH.LANE_PITCH;

/** SVG y of the newest row at drift 0: one row of rails runs off the top. */
export const Y0 = 2 * GITGRAPH.ROW;

/**
 * mulberry32, one draw: a value in [0, 1) and the next seed word. Integer
 * ops only, so every engine agrees to the bit.
 */
export const draw = (seed: number): [value: number, next: number] => {
  const s = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(s ^ (s >>> 15), 1 | s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return [((t ^ (t >>> 14)) >>> 0) / 4294967296, s];
};

export const groupSeed = (seed: number, i: number): number =>
  (seed ^ Math.imul(i + 1, 0x9e3779b1)) | 0;

export interface Commit {
  step: number;
  lane: number;
  merge: boolean;
}

export interface Branch {
  id: number;
  /** ≥ 1; lane 0 is main. */
  lane: number;
  /** The main commit it forked from. */
  parentStep: number;
  firstStep: number;
  lastStep: number;
  /** The main-lane merge commit; null while the branch is live. */
  mergeStep: number | null;
  /** Commits still to make before it may merge. */
  left: number;
}

export interface Group {
  /** PRNG word after the last draw. */
  seed: number;
  /** The next step; the newest commit is `step - 1`. */
  step: number;
  /** Step of the latest main-lane commit (merges count). */
  lastMain: number;
  /** Oldest → newest; at most `rows`. */
  commits: Commit[];
  /** Live branches, plus merged ones still (partly) in the window. */
  branches: Branch[];
  nextBranchId: number;
}

/** One chronological step. Copy-on-write throughout: the input is never touched. */
export const appendCommit = (group: Group, opts: GraphOptions): Group => {
  let seed = group.seed;
  const rnd = () => {
    const [v, next] = draw(seed);
    seed = next;
    return v;
  };

  const newest = group.step;
  const liveBranches = group.branches.filter((b) => b.mergeStep === null);
  const ready = liveBranches.filter((b) => b.left === 0);
  const running = liveBranches.filter((b) => b.left > 0);
  const used = new Set(liveBranches.map((b) => b.lane));
  const free: number[] = [];
  for (let l = 1; l < opts.lanes; l += 1) if (!used.has(l)) free.push(l);

  let branches = group.branches;
  let lastMain = group.lastMain;
  let nextBranchId = group.nextBranchId;
  let commit: Commit;

  if (ready.length && rnd() < opts.pMerge) {
    // Merge the oldest ready branch back into main.
    const target = ready.reduce((a, b) => (a.firstStep <= b.firstStep ? a : b));
    branches = branches.map((b) => (b.id === target.id ? { ...b, mergeStep: newest } : b));
    commit = { step: newest, lane: 0, merge: true };
    lastMain = newest;
  } else if (free.length && rnd() < opts.pFork) {
    // Fork from the latest main commit onto the lowest free lane.
    const len = opts.minLen + Math.floor(rnd() * (opts.maxLen - opts.minLen + 1));
    const lane = free[0];
    branches = [
      ...branches,
      { id: nextBranchId, lane, parentStep: lastMain, firstStep: newest, lastStep: newest, mergeStep: null, left: len - 1 },
    ];
    nextBranchId += 1;
    commit = { step: newest, lane, merge: false };
  } else if (running.length && rnd() < opts.pBranchCommit) {
    // Another commit on a branch that is still going.
    const target = running[Math.floor(rnd() * running.length)];
    branches = branches.map((b) => (b.id === target.id ? { ...b, lastStep: newest, left: b.left - 1 } : b));
    commit = { step: newest, lane: target.lane, merge: false };
  } else {
    commit = { step: newest, lane: 0, merge: false };
    lastMain = newest;
  }

  // Ring buffer: keep `rows` commits, and the branches that still touch them
  // (a merge one row below the oldest commit still draws its elbow).
  const minStep = newest - opts.rows + 1;
  const commits = [...group.commits, commit].filter((c) => c.step >= minStep);
  branches = branches.filter((b) => b.mergeStep === null || b.mergeStep >= minStep - 1);

  return { seed, step: newest + 1, lastMain, commits, branches, nextBranchId };
};

export const createGroup = (seed: number, opts: GraphOptions): Group => {
  let g: Group = {
    seed,
    step: 1,
    lastMain: 0,
    commits: [{ step: 0, lane: 0, merge: false }],
    branches: [],
    nextBranchId: 0,
  };
  const steps = opts.rows - 1 + opts.warmup;
  for (let i = 0; i < steps; i += 1) g = appendCommit(g, opts);
  return g;
};

export const createGroups = (seed: number, count: number, opts: GraphOptions): Group[] =>
  Array.from({ length: count }, (_, i) => createGroup(groupSeed(seed, i), opts));

export interface GroupLayout {
  /** The main rail, top edge to below the window. */
  main: string;
  branches: { key: number; d: string }[];
  nodes: { key: number; x: number; y: number; newest: boolean; merge: boolean }[];
}

/**
 * Geometry for one group in its own SVG coordinates. Every number is an
 * integer or `.5` (crisp 1px strokes), so the strings are identical everywhere.
 */
export const layoutGroup = (group: Group, m: Metrics): GroupLayout => {
  const newest = group.step - 1;
  const laneX = (l: number) => m.pad + l * m.lanePitch + 0.5;
  const y = (step: number) => Y0 + (newest - step) * m.row;
  const yBottom = Y0 + (m.rows + 1) * m.row;
  const x0 = laneX(0);

  const branches = group.branches.map((b) => {
    const xL = laneX(b.lane);
    // The fork elbow, unless the parent has scrolled out below the window.
    const start =
      newest - b.parentStep <= m.rows + 1
        ? `M${x0} ${y(b.parentStep)}L${xL} ${y(b.parentStep) - m.row}`
        : `M${xL} ${yBottom}`;
    // The merge elbow, or an open rail running off the top.
    const end = b.mergeStep === null ? "V0" : `V${y(b.mergeStep) + m.row}L${x0} ${y(b.mergeStep)}`;
    return { key: b.id, d: start + end };
  });

  const nodes = group.commits.map((c) => ({
    key: c.step,
    x: laneX(c.lane),
    y: y(c.step),
    newest: c.step === newest,
    merge: c.merge,
  }));

  return { main: `M${x0} 0V${yBottom}`, branches, nodes };
};
