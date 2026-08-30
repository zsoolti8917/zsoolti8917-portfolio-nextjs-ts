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

## Design

- **Generator** (`src/components/hero/backdrop/gitgraph.ts`, pure, vitest):
  mulberry32 PRNG threaded through the state; each lane-group is an independent
  repository with a main lane and two branch lanes. Time is in absolute steps,
  rows are derived, so appending a commit changes nothing already drawn. A
  branch forks from the latest main commit onto the lowest free lane, makes
  2–5 commits, merges back; lanes are reused only after the merge, so rails
  never overlap. A ring buffer keeps 56 rows. `layoutGroup` emits crisp
  integer-or-half coordinates so server and client strings are identical.
- **Component** (`GitGraphBackdrop.tsx`): eight `<svg>` roots at mirrored
  offsets 616/792/968/1144px from the centre — gutters only, at every width the
  same groups sit beside the window. Rendered from a constant seed, so it is
  there at first paint, for crawlers, and — still — under reduced motion.
- **Conveyor:** each root drifts `translateY(0 → 32px)` over 15 s, `linear
  infinite`, with a negative per-group delay so a commit lands somewhere every
  ~2 s. On `animationiteration` the component appends one commit inside
  `flushSync`, so the model shifts a row in the same frame the transform snaps
  back one — verified at 60× playback: 100 samples, zero backward jumps.
- **Gates:** the drift is `animation-name: none` until an effect (gated on
  `canAnimate`) sets `data-live`; an IntersectionObserver clears it when the
  hero scrolls off. `prefers-reduced-motion` freezes everything in CSS and
  turns the newest node into a still accent HEAD marker. Nothing in render
  reads the clock, `Math.random` or the window.
- **Look:** rails at 8–11% hairline, nodes at 16% fg, merges hollow, the newest
  node lands at 70% accent and settles over 2.4 s. The dot grid drops from 6%
  to 4% so the rails read above it. All tuning lives in `GITGRAPH`; alphas in
  the CSS block.

## Out of scope

Cursor reactivity; anything visible below `md`; a light theme.
