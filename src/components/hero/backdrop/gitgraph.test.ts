import { describe, expect, it } from "vitest";
import {
  COLORS,
  GITGRAPH,
  GROUP_W,
  METRICS,
  OPTS,
  Y0,
  appendCommit,
  createGroup,
  createGroups,
  draw,
  groupOffsets,
  groupSeed,
  layoutGroup,
  type Branch,
  type Group,
} from "./gitgraph";

/**
 * The commit graph behind the hero is generated, not drawn, and it is
 * server-rendered: the one property that matters is that the same seed yields
 * the same markup on the server and in the browser (else React hydration
 * mismatches). The rest are the invariants that make it read as a git graph:
 * one branch per lane at a time, rails that never overlap, forks that come
 * back, every commit linked to its parents, and a ring buffer that shifts by
 * exactly one row per append.
 */

const run = (g: Group, n: number) => {
  let cur = g;
  for (let i = 0; i < n; i += 1) cur = appendCommit(cur, OPTS);
  return cur;
};

const live = (g: Group) => g.branches.filter((b) => b.mergeStep === null);
const newestOf = (g: Group) => g.commits[g.commits.length - 1];

describe("draw", () => {
  it("is deterministic for a seed and stays in [0, 1)", () => {
    const seq = (seed: number) => {
      const out: number[] = [];
      let s = seed;
      for (let i = 0; i < 20; i += 1) {
        const [v, next] = draw(s);
        out.push(v);
        s = next;
      }
      return out;
    };
    const a = seq(123);
    expect(seq(123)).toEqual(a);
    expect(a.every((v) => v >= 0 && v < 1)).toBe(true);
    expect(seq(1)).not.toEqual(seq(2));
  });
});

describe("createGroups", () => {
  it("renders byte-identical layouts for the same seed (the hydration guarantee)", () => {
    const a = createGroups(GITGRAPH.SEED, 12, OPTS);
    const b = createGroups(GITGRAPH.SEED, 12, OPTS);
    expect(b).toEqual(a);
    expect(b.map((g) => layoutGroup(g, METRICS))).toEqual(a.map((g) => layoutGroup(g, METRICS)));
  });

  it("gives each group its own history", () => {
    const groups = createGroups(GITGRAPH.SEED, 12, OPTS);
    const histories = new Set(groups.map((g) => JSON.stringify(g.commits)));
    expect(histories.size).toBeGreaterThan(1);
    expect(groupSeed(1, 0)).not.toBe(groupSeed(1, 1));
  });

  it("opens with a full window of consecutive commits and exactly one newest node at Y0", () => {
    const g = createGroup(GITGRAPH.SEED, OPTS);
    expect(g.commits).toHaveLength(OPTS.rows);
    g.commits.forEach((c, i) => {
      if (i) expect(c.step).toBe(g.commits[i - 1].step + 1);
      expect(c.lane).toBeGreaterThanOrEqual(0);
      expect(c.lane).toBeLessThan(OPTS.lanes);
    });
    expect(newestOf(g).step).toBe(g.step - 1);
    const newest = layoutGroup(g, METRICS).nodes.filter((n) => n.newest);
    expect(newest).toHaveLength(1);
    expect(newest[0].y).toBe(Y0);
  });
});

describe("appendCommit", () => {
  it("never puts two live branches on one lane, and never on main", () => {
    let g = createGroup(7, OPTS);
    for (let i = 0; i < 3000; i += 1) {
      g = appendCommit(g, OPTS);
      const lanes = live(g).map((b) => b.lane);
      expect(new Set(lanes).size).toBe(lanes.length);
      expect(lanes.length).toBeLessThanOrEqual(OPTS.lanes - 1);
      expect(lanes.every((l) => l >= 1)).toBe(true);
    }
  });

  it("draws consecutive branches on a lane as disjoint rails", () => {
    let g = createGroup(11, OPTS);
    const seen = new Map<number, Branch>();
    for (let i = 0; i < 3000; i += 1) {
      g = appendCommit(g, OPTS);
      g.branches.forEach((b) => seen.set(b.id, b));
    }
    for (let lane = 1; lane < OPTS.lanes; lane += 1) {
      const onLane = Array.from(seen.values())
        .filter((b) => b.lane === lane)
        .sort((a, b) => a.parentStep - b.parentStep);
      expect(onLane.length).toBeGreaterThanOrEqual(2); // lanes are reused
      for (let i = 1; i < onLane.length; i += 1) {
        const prev = onLane[i - 1];
        const cur = onLane[i];
        expect(prev.mergeStep).not.toBeNull();
        expect(cur.parentStep + 1).toBeGreaterThan((prev.mergeStep as number) - 1);
      }
    }
  });

  it("links every commit to its parents like a git DAG", () => {
    let g = createGroup(3, OPTS);
    let lastMain = g.lastMain;
    const lastOnLane = new Map<number, number>(); // lane → step of its latest commit
    g.commits.forEach((c) => lastOnLane.set(c.lane, c.step));
    for (let i = 0; i < 2000; i += 1) {
      g = appendCommit(g, OPTS);
      const c = newestOf(g);
      c.parents.forEach((p) => expect(p.step).toBeLessThan(c.step));
      if (c.lane === 0 && c.parents.length === 1) {
        // A plain main commit: parent is the previous main commit.
        expect(c.parents[0]).toEqual({ step: lastMain, lane: 0, c: 0 });
        lastMain = c.step;
      } else if (c.lane === 0) {
        // A merge: previous main first, then the tip of the merged branch.
        expect(c.parents).toHaveLength(2);
        expect(c.parents[0]).toEqual({ step: lastMain, lane: 0, c: 0 });
        const tip = c.parents[1];
        expect(tip.lane).toBeGreaterThanOrEqual(1);
        expect(lastOnLane.get(tip.lane)).toBe(tip.step);
        const b = g.branches.find((x) => x.mergeStep === c.step);
        expect(b).toBeDefined();
        expect(b?.lane).toBe(tip.lane);
        expect(b?.lastStep).toBe(tip.step);
        expect(tip.c).toBe(b?.c);
        lastMain = c.step;
      } else {
        const b = live(g).find((x) => x.lane === c.lane) as Branch;
        expect(b).toBeDefined();
        expect(c.c).toBe(b.c);
        expect(c.parents).toHaveLength(1);
        if (b.firstStep === c.step) {
          // A fork: the parent is the main commit it left from.
          expect(c.parents[0]).toEqual({ step: b.parentStep, lane: 0, c: 0 });
          expect(b.parentStep).toBe(lastMain);
        } else {
          expect(c.parents[0]).toEqual({ step: lastOnLane.get(c.lane), lane: c.lane, c: b.c });
        }
      }
      lastOnLane.set(c.lane, c.step);
    }
  });

  it("colours main 0 and every branch from the rest of the palette", () => {
    let g = createGroup(21, OPTS);
    const used = new Set<number>();
    for (let i = 0; i < 1500; i += 1) {
      g = appendCommit(g, OPTS);
      const c = newestOf(g);
      if (c.lane === 0) expect(c.c).toBe(0);
      else {
        expect(c.c).toBeGreaterThanOrEqual(1);
        expect(c.c).toBeLessThan(COLORS);
        used.add(c.c);
      }
    }
    expect(used.size).toBe(COLORS - 1);
  });

  it("merges every branch back eventually", () => {
    let g = createGroup(5, OPTS);
    const seen = new Map<number, Branch>();
    for (let i = 0; i < 3000; i += 1) {
      g = appendCommit(g, OPTS);
      g.branches.forEach((b) => seen.set(b.id, b));
    }
    for (const b of Array.from(seen.values())) {
      if (b.firstStep < g.step - 200) expect(b.mergeStep).not.toBeNull();
    }
  });

  it("shifts every surviving node and edge down exactly one row", () => {
    const g = createGroup(GITGRAPH.SEED, OPTS);
    const before = layoutGroup(g, METRICS);
    const g2 = appendCommit(g, OPTS);
    const after = layoutGroup(g2, METRICS);
    const nodes = new Map(after.nodes.map((n) => [n.key, n]));
    before.nodes.forEach((n) => {
      const moved = nodes.get(n.key);
      if (moved) {
        expect(moved.y).toBe(n.y + METRICS.row);
        expect(moved.newest).toBe(false);
      }
    });
    const edges = new Map(after.edges.map((e) => [e.key, e]));
    const shiftY = (d: string) =>
      d.replace(/(-?\d+(?:\.5)?) (-?\d+(?:\.5)?)/g, (_, x, y) => `${x} ${Number(y) + METRICS.row}`)
        .replace(/V(-?\d+(?:\.5)?)/g, (_, y) => `V${Number(y) + METRICS.row}`);
    before.edges.forEach((e) => {
      const moved = edges.get(e.key);
      if (moved) {
        expect(moved.d).toBe(shiftY(e.d));
        expect(moved.newest).toBe(false);
      }
    });
    const newest = after.nodes.filter((n) => n.newest);
    expect(newest).toHaveLength(1);
    expect(newest[0].y).toBe(Y0);
    expect(newest[0].key).toBe(g2.step - 1);
    expect(after.edges.filter((e) => e.newest).length).toBe(newestOf(g2).parents.length);
  });

  it("caps the window at `rows` commits and drops branches once they scroll out", () => {
    const g = run(createGroup(9, OPTS), 500);
    const newest = g.step - 1;
    const minStep = newest - OPTS.rows + 1;
    expect(g.commits).toHaveLength(OPTS.rows);
    expect(g.commits[0].step).toBe(minStep);
    g.branches.forEach((b) => {
      if (b.mergeStep !== null) expect(b.mergeStep).toBeGreaterThanOrEqual(minStep);
    });
    expect(g.branches.length).toBeLessThanOrEqual(OPTS.rows);
  });

  it("is pure: the input is untouched and a second call gives the same answer", () => {
    const g = createGroup(2, OPTS);
    const snapshot = JSON.stringify(g);
    const a = appendCommit(g, OPTS);
    const b = appendCommit(g, OPTS);
    expect(JSON.stringify(g)).toBe(snapshot);
    expect(b).toEqual(a);
  });
});

describe("layoutGroup", () => {
  const laneX = (l: number) => METRICS.pad + l * METRICS.lanePitch + 0.5;

  it("emits crisp integer-or-half coordinates only", () => {
    const g = run(createGroup(GITGRAPH.SEED, OPTS), 300);
    const L = layoutGroup(g, METRICS);
    const nums = (d: string) => d.match(/-?[\d.]+(e[-+]?\d+)?/g) ?? [];
    L.edges.forEach((e) => nums(e.d).forEach((n) => expect(n).toMatch(/^-?\d+(\.5)?$/)));
    L.nodes.forEach((n) => expect(String(n.x)).toMatch(/^\d+\.5$/));
  });

  it("draws same-lane edges as verticals from the parent up to the child, and lane changes as an S-curve beside main", () => {
    let g = createGroup(13, OPTS);
    let sawFork = false;
    let sawMerge = false;
    let sawVertical = false;
    const half = METRICS.row / 2;
    for (let i = 0; i < 1500 && !(sawFork && sawMerge && sawVertical); i += 1) {
      g = appendCommit(g, OPTS);
      const c = newestOf(g);
      const L = layoutGroup(g, METRICS);
      const yOf = (step: number) => Y0 + (c.step - step) * METRICS.row;
      c.parents.forEach((p, k) => {
        const e = L.edges.find((x) => x.key === `${c.step}:${k}`);
        expect(e).toBeDefined();
        const d = (e as { d: string }).d;
        if (p.lane === c.lane) {
          sawVertical = true;
          expect(d).toBe(`M${laneX(c.lane)} ${yOf(p.step)}V${Y0}`);
        } else if (p.lane === 0) {
          // A fork leaves main in the row right above the parent, then runs up.
          sawFork = true;
          const yp = yOf(p.step);
          const curve = `M${laneX(0)} ${yp}C${laneX(0)} ${yp - half} ${laneX(c.lane)} ${yp - half} ${laneX(c.lane)} ${yp - METRICS.row}`;
          expect(d).toBe(yp - METRICS.row > Y0 ? `${curve}V${Y0}` : curve);
          expect(e?.c).toBe(c.c);
        } else {
          // A merge runs up the branch lane, then curves into main in the last row.
          sawMerge = true;
          const yt = yOf(p.step);
          const tail = `C${laneX(p.lane)} ${Y0 + half} ${laneX(0)} ${Y0 + half} ${laneX(0)} ${Y0}`;
          expect(d).toBe(yt > Y0 + METRICS.row ? `M${laneX(p.lane)} ${yt}V${Y0 + METRICS.row}${tail}` : `M${laneX(p.lane)} ${yt}${tail}`);
          expect(e?.c).toBe(p.c);
        }
      });
    }
    expect(sawFork && sawMerge && sawVertical).toBe(true);
  });

  it("flags merge nodes and colours nodes by their branch", () => {
    const g = run(createGroup(17, OPTS), 200);
    const L = layoutGroup(g, METRICS);
    const byStep = new Map(g.commits.map((c) => [c.step, c]));
    L.nodes.forEach((n) => {
      const c = byStep.get(n.key);
      expect(n.merge).toBe((c?.parents.length ?? 0) > 1);
      expect(n.c).toBe(c?.c);
      expect(n.x).toBe(laneX(c?.lane ?? 0));
    });
  });
});

describe("tiling", () => {
  it("keeps lane spacing uniform across group seams and tiles outward from the window edge", () => {
    expect(GROUP_W).toBe(2 * GITGRAPH.PAD + (GITGRAPH.LANES - 1) * GITGRAPH.LANE_PITCH);
    expect(2 * GITGRAPH.PAD).toBe(GITGRAPH.LANE_PITCH);
    const offsets = groupOffsets();
    expect(offsets).toHaveLength(2 * GITGRAPH.PER_SIDE);
    // Mirrored pairs, first pair flush against the window edge, then no gaps.
    for (let k = 0; k < GITGRAPH.PER_SIDE; k += 1) {
      const right = offsets[2 * k + 1];
      expect(offsets[2 * k]).toBe(-right);
      expect(right - GROUP_W / 2).toBe(GITGRAPH.WINDOW_HALF + k * GROUP_W);
    }
  });
});
