import { describe, expect, it } from "vitest";
import {
  GITGRAPH,
  GROUP_W,
  METRICS,
  OPTS,
  Y0,
  appendCommit,
  createGroup,
  createGroups,
  draw,
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
 * back, and a ring buffer that shifts by exactly one row per append.
 */

const run = (g: Group, n: number) => {
  let cur = g;
  for (let i = 0; i < n; i += 1) cur = appendCommit(cur, OPTS);
  return cur;
};

const live = (g: Group) => g.branches.filter((b) => b.mergeStep === null);

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
    const a = createGroups(GITGRAPH.SEED, 8, OPTS);
    const b = createGroups(GITGRAPH.SEED, 8, OPTS);
    expect(b).toEqual(a);
    expect(b.map((g) => layoutGroup(g, METRICS))).toEqual(a.map((g) => layoutGroup(g, METRICS)));
  });

  it("gives each group its own history", () => {
    const groups = createGroups(GITGRAPH.SEED, 8, OPTS);
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
    expect(g.commits[g.commits.length - 1].step).toBe(g.step - 1);
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
    // Collect every branch ever created (the ring buffer drops old ones).
    let g = createGroup(11, OPTS);
    const seen = new Map<number, Branch>();
    for (let i = 0; i < 3000; i += 1) {
      g = appendCommit(g, OPTS);
      g.branches.forEach((b) => seen.set(b.id, b));
    }
    for (let lane = 1; lane < OPTS.lanes; lane += 1) {
      const onLane = Array.from(seen.values()).filter((b) => b.lane === lane).sort((a, b) => a.parentStep - b.parentStep);
      expect(onLane.length).toBeGreaterThanOrEqual(2); // lanes are reused
      for (let i = 1; i < onLane.length; i += 1) {
        const prev = onLane[i - 1];
        const cur = onLane[i];
        expect(prev.mergeStep).not.toBeNull();
        // prev is drawn up to mergeStep-1; cur starts at parentStep+1.
        expect(cur.parentStep + 1).toBeGreaterThan((prev.mergeStep as number) - 1);
      }
    }
  });

  it("keeps every branch well-formed and every commit accounted for", () => {
    let g = createGroup(3, OPTS);
    const start = g.step;
    const seen = new Map<number, Branch>();
    // Main commits the loop can vouch for: the ones in the opening window, and
    // every lane-0 commit it makes itself.
    const mainSteps = new Set<number>(g.commits.filter((c) => c.lane === 0).map((c) => c.step));
    const laneCommits: { step: number; lane: number }[] = [];
    for (let i = 0; i < 2000; i += 1) {
      g = appendCommit(g, OPTS);
      const c = g.commits[g.commits.length - 1];
      if (c.lane === 0) mainSteps.add(c.step);
      else laneCommits.push(c);
      g.branches.forEach((b) => seen.set(b.id, b));
      if (c.merge) {
        expect(c.lane).toBe(0);
        expect(g.branches.filter((b) => b.mergeStep === c.step)).toHaveLength(1);
      }
    }
    for (const b of Array.from(seen.values())) {
      expect(b.parentStep).toBeLessThan(b.firstStep);
      expect(b.firstStep).toBeLessThanOrEqual(b.lastStep);
      if (b.mergeStep !== null) expect(b.mergeStep).toBeGreaterThan(b.lastStep);
      if (b.firstStep >= start) expect(mainSteps.has(b.parentStep)).toBe(true);
    }
    for (const c of laneCommits) {
      const owners = Array.from(seen.values()).filter(
        (b) => b.lane === c.lane && b.firstStep <= c.step && c.step <= b.lastStep
      );
      expect(owners).toHaveLength(1);
    }
  });

  it("merges every branch back eventually", () => {
    let g = createGroup(5, OPTS);
    const seen = new Map<number, Branch>();
    const N = 3000;
    for (let i = 0; i < N; i += 1) {
      g = appendCommit(g, OPTS);
      g.branches.forEach((b) => seen.set(b.id, b));
    }
    for (const b of Array.from(seen.values())) {
      if (b.firstStep < g.step - 200) expect(b.mergeStep).not.toBeNull();
    }
  });

  it("shifts every surviving node down exactly one row", () => {
    const g = createGroup(GITGRAPH.SEED, OPTS);
    const before = layoutGroup(g, METRICS);
    const g2 = appendCommit(g, OPTS);
    const after = layoutGroup(g2, METRICS);
    const byKey = new Map(after.nodes.map((n) => [n.key, n]));
    before.nodes.forEach((n) => {
      const moved = byKey.get(n.key);
      if (moved) {
        expect(moved.y).toBe(n.y + METRICS.row);
        expect(moved.newest).toBe(false);
      }
    });
    const newest = after.nodes.filter((n) => n.newest);
    expect(newest).toHaveLength(1);
    expect(newest[0].y).toBe(Y0);
    expect(newest[0].key).toBe(g2.step - 1);
  });

  it("caps the window at `rows` commits and drops branches once they scroll out", () => {
    const g = run(createGroup(9, OPTS), 500);
    const newest = g.step - 1;
    const minStep = newest - OPTS.rows + 1;
    expect(g.commits).toHaveLength(OPTS.rows);
    expect(g.commits[0].step).toBe(minStep);
    g.branches.forEach((b) => {
      if (b.mergeStep !== null) expect(b.mergeStep).toBeGreaterThanOrEqual(minStep - 1);
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
  it("emits crisp integer-or-half coordinates only", () => {
    const g = run(createGroup(GITGRAPH.SEED, OPTS), 300);
    const L = layoutGroup(g, METRICS);
    const nums = (d: string) => d.match(/-?[\d.]+(e[-+]?\d+)?/g) ?? [];
    [L.main, ...L.branches.map((b) => b.d)].forEach((d) => {
      nums(d).forEach((n) => expect(n).toMatch(/^-?\d+(\.5)?$/));
    });
    expect(L.main).toBe(`M${METRICS.pad + 0.5} 0V${Y0 + (METRICS.rows + 1) * METRICS.row}`);
    L.nodes.forEach((n) => expect(String(n.x)).toMatch(/^\d+\.5$/));
  });

  it("clamps a branch whose fork scrolled out and leaves an open branch running off the top", () => {
    // Find, by running long enough, a live state that has (a) a branch whose
    // parent is below the window and (b) an open branch, and assert both.
    let g = createGroup(13, OPTS);
    let sawClamped = false;
    let sawOpen = false;
    const yBottom = Y0 + (METRICS.rows + 1) * METRICS.row;
    for (let i = 0; i < 3000 && !(sawClamped && sawOpen); i += 1) {
      g = appendCommit(g, OPTS);
      const newest = g.step - 1;
      const L = layoutGroup(g, METRICS);
      g.branches.forEach((b) => {
        const d = L.branches.find((x) => x.key === b.id)?.d;
        if (!d) return;
        if (newest - b.parentStep > METRICS.rows + 1) {
          sawClamped = true;
          expect(d.startsWith(`M${METRICS.pad + b.lane * METRICS.lanePitch + 0.5} ${yBottom}V`)).toBe(true);
        }
        if (b.mergeStep === null) {
          sawOpen = true;
          expect(d.endsWith("V0")).toBe(true);
        }
      });
    }
    expect(sawClamped && sawOpen).toBe(true);
  });

  it("uses the group width the component lays out with", () => {
    expect(GROUP_W).toBe(2 * GITGRAPH.PAD + (GITGRAPH.LANES - 1) * GITGRAPH.LANE_PITCH);
  });
});
