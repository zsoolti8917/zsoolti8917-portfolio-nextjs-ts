# Hero refinements: centred header, one pre-run block, typed-out output

_2026-08-30. Follows the v3 terminal hero (`2026-08-29-terminal-hero-redesign-design.md`)._

## Why

Three things Zsolt did not like after v3 shipped:

1. The header links sat visibly left of the page centre.
2. The first screen was a wall of monospace: the `whoami` card and then the
   whole eleven-row project list.
3. Output "just spawned" — the letters should type out like a terminal.

Decisions taken with Zsolt: everything the shell prints types out, the card on
load included; the window stays full-height; the card's `since` row folds into
`based`.

## Research, in one paragraph each

**Header.** With `justify-between` a middle item is centred in the gap between
its neighbours, so a 22px logo and a ~290px actions cluster put the links
~130px off centre at every width. The fix is the status bar's own pattern, a
`1fr auto 1fr` grid — with `minmax(0,1fr)` so a long locale label cannot blow
the sticky header out into a page-wide scrollbar, and `justify-self-start` on
the logo so the stretched grid item does not become a 400px hit target.
Switched on at `lg`, not `md`: at 768px the three groups need ~930px to clear
a true centre.

**First screen.** Of eight terminal portfolios opened (satnaing, craigfeldman,
LiveTerm, m4tt72, webshell, kuber.studio…), none pre-runs a content block; the
median first paint is art plus two or three lines, and LiveTerm has a fetch
card it deliberately withholds. Fetch cards read as fetch cards at five to
eight rows. The project list was ~25 lines in the least-read part of a
full-viewport hero (NN/g: 65% of above-fold attention is in the upper half),
and a pure duplicate of the `Projects` section further down the same HTML —
cutting it removes no crawler-visible words.

**Typing.** No terminal portfolio above 100★ types its output; real terminals
dump a frame at once, so typing is a pacing device and must never cost reading
time (~20 chars/s). Libraries are out: typed.js went GPL in v3 (Jan 2026),
react-type-animation is permanently memoised (a locale switch keeps typing the
old language), and every one slices strings, which destroys the clickable
`Segment` model. The recurring HN complaint about typing heroes is layout shift
as lines wrap. So: a zero-layout-shift, paint-only reveal.

## Design

### Header — `src/components/nav/TopNav.tsx`

`lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]` on the bar;
`justify-self-start` / `min-w-0 justify-self-center` / `min-w-0 justify-self-end`
on logo / links / actions. Below `lg` the bar is still flex, so below `md`
(links hidden) there is no phantom empty track. DOM and tab order unchanged.

### One pre-run block — `session.ts`, `commands.ts`, messages

`DEMO_COMMANDS = ["whoami"]`. The card has five rows: role, now, based, stack,
status. `based` is an ICU string per locale — `"{location} · since {since}"`,
`"{location} · od {since}"`, `"{location} · {since} óta"` — fed from the shared
location copy and the About section's start year. Tagline and all seven stack
chips stay. No "try:" hint line: the chips already answer the blank prompt.

### Typed-out output — `reveal.ts`, `useTypeReveal.ts`, `revealMode`

Every block renders complete, on the server and the client alike. After mount,
`useTypeReveal` hides the not-yet-typed remainder with the CSS Custom Highlight
API — one `Range` from the write head to the end of the block, painted
`color: transparent` by `::highlight(term-untyped)` — and advances the range's
start every frame. No DOM mutation, no React renders, no layout shift; the
crawler HTML is untouched and `aria-live` announces the block once, in full.
Browsers without `CSS.highlights` (Firefox < 140) get the old per-line stagger.

**Pacing is a budget, not a speed** (`reveal.ts`, unit-tested): 1,100 ms per
block, clamped between 80 and 1,000 chars/s, with a 40 ms beat at the end of
each of the first twelve lines and sentence/clause punctuation weighted ×7/×4
— redistributed inside the budget, never added. A three-line error takes
0.75 s, the card 1.1 s, the longest project write-up ~2.1 s. Short blocks
visibly type, long blocks flood.

**Sequence on load**: the demo types `whoami` (38 ms/key ± 25 % jitter), waits
120 ms, then arms the card, which types itself out. The card's CSS stagger is
deferred by `--boot: 1200ms` on `[data-demo]` so the server-painted text is not
shown in full and then hidden again while the page hydrates; without
JavaScript the card simply appears after that beat, and under reduced motion
the media query shows it at once.

**Gating** (`revealMode`, unit-tested): a block the visitor caused types on
mount unless they have fast-forwarded before; the pre-run card waits until
armed, and settles (runs the stagger now) the moment it is clear it will not
be typed — but never before the client is ready, because until then the
deferral is the only thing preventing the flash.

**Skip**: the input, chips and links are never disabled. Any keypress, any
`pointerdown` in the output, or running a command ends the demo; if a block was
mid-reveal that counts as a fast-forward and `sessionStorage["term:instant"]`
makes the rest of the session instant. `aria-busy` is true while anything
types. Autoscroll brings a new block's *top* into view and then follows the
write head, forward only.

## Not done, on purpose

- No caret trails the output; a real terminal's cursor sits at the prompt.
- The `.term-line` stagger survives only as the fallback.
- An HTML CV as the primary `cv` target (HN's most-cited fixable complaint
  about terminal portfolios) is a separate change.

## Verification

`npm test` (97), `tsc --noEmit`, `next lint`; raw HTML per locale carries the
name, headline, ESA line, merged `based` row and all project titles; header
screenshots at 1440/1024 (centred) and 768 (flex, no collision); the reveal
observed in Chrome, Safari and Firefox with Layout Shifts = 0; reduced motion
and JS-off checked; VoiceOver announces a block once.
