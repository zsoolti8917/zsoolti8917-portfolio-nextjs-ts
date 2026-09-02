# Git-graph backdrop: an ambient commit graph behind the hero window

_2026-08-30. Follows the hero refinements (`2026-08-30-hero-refinements-design.md`)._

## Why

The backdrop behind the terminal window was three still layers — a dot grid,
one indigo glow, noise — and read as a flat fill. Zsolt wanted a subtle,
coding-themed animation there.

Decisions taken with Zsolt, in order: **ambient** (slow, low-alpha, never
competing with the terminal text) over cursor-reactive or showpiece; **git**
(a faint `git log --graph`) over space/ESA, tmux-panes, or Kubernetes
reconciliation; **server-rendered SVG with compositor-only drift** over canvas
2D or a pure-CSS repeating tile.

## Research, in one paragraph each

**What the good sites do.** Linear and GitHub ship a still image plus one glow;
Fly.io, Cursor, Ghostty and Railway ship nothing; Vercel, Zed and Raycast ship a
shader with a static fallback. The 2025–26 texture of the moment is dither/ASCII
shaders — common enough now to read as a template. Matrix rain and linked
particle constellations are the things a portfolio must not do.

**What is cheap.** Only `transform` and `opacity` animate on the compositor;
`background-position`, gradient stops and `stroke-dashoffset` repaint every
frame on the main thread, next to the typing reveal, and show up in INP. And
only an `<svg>` **root** gets a compositor layer — a transform on an inner
`<g>` repaints the whole SVG each frame. So: paint rarely, move by transform,
and animate `<svg>` roots.

**The concept.** The status bar already prints `main@1208c2f`; the graph is the
history behind that hash. Vertical lanes suit the tall, narrow gutters beside
the 1152px window, which is the only place the backdrop shows (below `md` the
window is full-bleed).

## Design (v2 — after Zsolt's review of v1)

v1 was eight thin monochrome columns drifting at clock-hand speed. Zsolt asked
for **full-width coverage, GitKraken colours, and merges you can watch
happen**. So:

- **Generator** (`src/components/hero/backdrop/gitgraph.ts`, pure, vitest):
  mulberry32 PRNG threaded through the state; each lane-group is an independent
  repository with a main lane and three branch lanes. Time is in absolute steps,
  rows are derived, so appending a commit changes nothing already drawn. Every
  commit carries its **parent links** — the real DAG — and a palette index: main
  is 0 (the accent), each branch takes the next of six colours. A branch forks
  from the latest main commit onto the lowest free lane, makes 2–6 commits,
  merges back; lanes are reused only after the merge, so rails never overlap.
  A ring buffer keeps 44 rows. `layoutGroup` emits one node per commit and one
  edge per parent link: verticals on a lane, S-curves for a fork (leaving main
  in the row above the parent) and a merge (arriving at main in the last row),
  all integer-or-half coordinates so server and client strings are identical.
- **Tiling:** groups are 112px wide (pad = half the lane pitch, so lane spacing
  is uniform across seams) and tile outward from the window edge, six per
  side, mirrored — the gutter reads as one wide graph at any viewport width and
  the same groups sit beside the window everywhere. Twelve `<svg>` roots.
- **Events instead of drift:** nothing moves between commits. When one lands
  (every ~12 s ± 40 % per group, only for groups inside the viewport and only
  while the hero is on screen), the model gains a row inside `flushSync` and,
  in the same frame, the column slides down one row via a WAAPI `transform` on
  its root (compositor); the new edge draws in from its parent
  (`pathLength="1"` + dash-offset) and the node pops. Idle cost is zero.
- **Gates:** the scheduler lives in an effect gated on `canAnimate`; the SSR'd
  graph is what renders under reduced motion and without JavaScript, with the
  newest commits simply a little brighter. Nothing in render reads the clock,
  `Math.random` or the window.
- **Look:** 2px strokes at 45 % alpha, 3.5px nodes at 85 %, merges hollow.
  Palette and alphas are custom properties on `.gg` in the CSS block;
  geometry and timing in `GITGRAPH`. The dot grid drops from 6 % to 4 %.

## Out of scope

Cursor reactivity; anything visible below `md`; a light theme.
