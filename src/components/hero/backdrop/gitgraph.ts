/**
 * The commit graph behind the hero window: a `git log --graph` read as a live
 * texture. Pure — no DOM, no React, no clock, no `Math.random` — because it is
 * SERVER-RENDERED: the same seed must yield byte-identical markup on the server
 * and in the browser, or React reports a hydration mismatch and repaints.
 *
 * Every lane-group is an independent little repository: a main lane and up to
 * `LANES - 1` branch lanes. Time runs in "steps" (one commit each, absolute and
 * chronological); a row is derived from a step, so appending a commit changes
 * nothing about the commits already there — React keys stay stable and the
 * whole window shifts down by exactly one row. Each commit carries its parent
 * links, so the edges are the real DAG: a fork curves out of main, a merge
 * curves back in.
 */

/** The one place for tuning. Colours and alphas live in CSS (design tokens). */
export const GITGRAPH = {
  SEED: 0x2f6b1c3d,
  /** Main + branch lanes per group. */
  LANES: 4,
  /** Ring capacity = visible rows. 44 × 32px covers a 1440p-tall hero. */
  ROWS: 44,
  /** Extra steps at creation, so the window opens mid-history. */
  WARMUP: 64,
  /** Pixels per row — also how far a column slides when a commit lands. */
  ROW: 32,
  LANE_PITCH: 28,
  /** Half the pitch, so lanes stay evenly spaced across group seams. */
  PAD: 14,
  /** Half of the window's `md:max-w-6xl` (72rem). Groups tile outward from here. */
  WINDOW_HALF: 576,
  /** Groups per gutter: 6 × 112px covers gutters up to ~2500px-wide viewports. */
  PER_SIDE: 6,
  /** Mean time between commits in one group; ±JITTER of it. */
  INTERVAL_MS: 12_000,
  JITTER: 0.4,
  /** How long a column takes to slide down one row when a commit lands. */
  SHIFT_MS: 500,
  /** Node radius. */
  R: 3.5,
  P_MERGE: 0.5,
  P_FORK: 0.22,
  P_BRANCH_COMMIT: 0.55,
  MIN_LEN: 2,
  MAX_LEN: 6,
} as const;

/** Palette size: index 0 is main, 1.. are branches. Values are in the CSS block. */
export const COLORS = 7;

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
}

export const METRICS: Metrics = {
  row: GITGRAPH.ROW,
  lanePitch: GITGRAPH.LANE_PITCH,
  pad: GITGRAPH.PAD,
};

/** Width of one group's `<svg>`. */
export const GROUP_W = 2 * GITGRAPH.PAD + (GITGRAPH.LANES - 1) * GITGRAPH.LANE_PITCH;

/** SVG y of the newest row: one row of headroom above it for the slide-in. */
export const Y0 = 2 * GITGRAPH.ROW;

/**
 * Group centres in px from the section centre, mirrored: [-o0, o0, -o1, o1…].
 * The first pair sits flush against the window edge; the rest tile outward
 * with no gaps, so the gutter reads as one wide graph at any viewport width.
 */
export const groupOffsets = (): number[] =>
  Array.from({ length: GITGRAPH.PER_SIDE }, (_, k) => GITGRAPH.WINDOW_HALF + GROUP_W * (k + 0.5)).flatMap(
    (o) => [-o, o]
  );

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

/** One end of an edge: enough to draw it after the commit itself scrolled out. */
export interface Parent {
  step: number;
  lane: number;
  /** Palette index. */
  c: number;
}

export interface Commit {
  step: number;
  lane: number;
  /** Palette index: 0 on main, the branch's colour otherwise. */
  c: number;
  /** Main-lane parent first; a merge adds the tip of the merged branch. */
  parents: Parent[];
}

export interface Branch {
  id: number;
  /** ≥ 1; lane 0 is main. */
  lane: number;
  c: number;
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
  /** Live branches, plus merged ones still in the window. */
  branches: Branch[];
  nextBranchId: number;
}

const MAIN: Omit<Parent, "step"> = { lane: 0, c: 0 };

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
    commit = {
      step: newest,
      lane: 0,
      c: 0,
      parents: [
        { step: lastMain, ...MAIN },
        { step: target.lastStep, lane: target.lane, c: target.c },
      ],
    };
    lastMain = newest;
  } else if (free.length && rnd() < opts.pFork) {
    // Fork from the latest main commit onto the lowest free lane.
    const len = opts.minLen + Math.floor(rnd() * (opts.maxLen - opts.minLen + 1));
    const lane = free[0];
    const c = 1 + (nextBranchId % (COLORS - 1));
    branches = [
      ...branches,
      { id: nextBranchId, lane, c, parentStep: lastMain, firstStep: newest, lastStep: newest, mergeStep: null, left: len - 1 },
    ];
    nextBranchId += 1;
    commit = { step: newest, lane, c, parents: [{ step: lastMain, ...MAIN }] };
  } else if (running.length && rnd() < opts.pBranchCommit) {
    // Another commit on a branch that is still going.
    const target = running[Math.floor(rnd() * running.length)];
    branches = branches.map((b) => (b.id === target.id ? { ...b, lastStep: newest, left: b.left - 1 } : b));
    commit = {
      step: newest,
      lane: target.lane,
      c: target.c,
      parents: [{ step: target.lastStep, lane: target.lane, c: target.c }],
    };
  } else {
    commit = { step: newest, lane: 0, c: 0, parents: [{ step: lastMain, ...MAIN }] };
    lastMain = newest;
  }

  // Ring buffer: keep `rows` commits and the branches that still touch them.
  const minStep = newest - opts.rows + 1;
  const commits = [...group.commits, commit].filter((c) => c.step >= minStep);
  branches = branches.filter((b) => b.mergeStep === null || b.mergeStep >= minStep);

  return { seed, step: newest + 1, lastMain, commits, branches, nextBranchId };
};

export const createGroup = (seed: number, opts: GraphOptions): Group => {
  let g: Group = {
    seed,
    step: 1,
    lastMain: 0,
    commits: [{ step: 0, lane: 0, c: 0, parents: [] }],
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
  nodes: { key: number; x: number; y: number; c: number; newest: boolean; merge: boolean }[];
  /** One per parent link, drawn from the parent (below) up to the child. */
  edges: { key: string; d: string; c: number; newest: boolean }[];
}

/**
 * Geometry for one group in its own SVG coordinates. Every number is an
 * integer or `.5` (crisp strokes), so the strings are identical everywhere.
 * Paths start at the parent so a draw-on animation runs up to the new commit.
 */
export const layoutGroup = (group: Group, m: Metrics): GroupLayout => {
  const newest = group.step - 1;
  const laneX = (l: number) => m.pad + l * m.lanePitch + 0.5;
  const y = (step: number) => Y0 + (newest - step) * m.row;
  const half = m.row / 2;
  const x0 = laneX(0);

  const edge = (c: Commit, p: Parent): string => {
    const xc = laneX(c.lane);
    const xp = laneX(p.lane);
    const yc = y(c.step);
    const yp = y(p.step);
    if (p.lane === c.lane) return `M${xc} ${yp}V${yc}`;
    if (p.lane === 0) {
      // A fork: leave main in the row right above the parent, then run up.
      const curve = `M${x0} ${yp}C${x0} ${yp - half} ${xc} ${yp - half} ${xc} ${yp - m.row}`;
      return yp - m.row > yc ? `${curve}V${yc}` : curve;
    }
    // A merge: run up the branch lane, then curve into main in the last row.
    const tail = `C${xp} ${yc + half} ${x0} ${yc + half} ${x0} ${yc}`;
    return yp > yc + m.row ? `M${xp} ${yp}V${yc + m.row}${tail}` : `M${xp} ${yp}${tail}`;
  };

  const nodes = group.commits.map((c) => ({
    key: c.step,
    x: laneX(c.lane),
    y: y(c.step),
    c: c.c,
    newest: c.step === newest,
    merge: c.parents.length > 1,
  }));

  const edges = group.commits.flatMap((c) =>
    c.parents.map((p, k) => ({
      key: `${c.step}:${k}`,
      d: edge(c, p),
      // An edge wears the branch's colour: the child's, unless the child is
      // the merge commit on main — then the branch it absorbs.
      c: p.lane === c.lane || p.lane === 0 ? c.c : p.c,
      newest: c.step === newest,
    }))
  );

  return { nodes, edges };
};
