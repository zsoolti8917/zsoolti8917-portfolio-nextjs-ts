# Hero + site rework — "the terminal is the product"

## Context

The portfolio (zsoltvarjuprojects.com, Next 14 pages router, Tailwind, next-intl en/sk/hu) already has an
interactive terminal hero whose *engine* is good: reduced parser, synonym + fuzzy map, clickable
output segments, SSR'd `about` output for crawlers, ArrowRight ghost completion. Zsolt likes the shell
idea; the problem is the **UI and layout**. Observed on the live dev server (1440px + 390px screenshots):

- The hero is three stacked things (editorial headline → generic bordered box → three buttons). Neither
  the headline nor the terminal owns the first screen; the terminal reads as an embedded widget.
- Terminal has no hierarchy: window chrome is three grey dots, the `about` output is ~8 lines of
  13px grey monospace prose — unscannable in the 5-second recruiter window.
- Redundancy above the fold: CV reachable 3× (header "My Resume", chip `cv`, CTA "CV (PDF)");
  window title and boot banner say the same sentence.
- Site chrome is the 2022 Hover.dev template: 54px vertical sidebar rail with rotated labels, no
  mobile nav, indigo "wipe" Reveal on every heading, stock zinc/indigo with **zero design tokens**
  (`tailwind.config.ts` is empty), `README.md` is still the template readme.
- Projects grid: 8 of 11 cards have no image and fall back to an initial-letter tile.

Goal: a hero (and consistent site) that impresses recruiters *and* engineers in 5 seconds, keeps
every rule in memory `terminal-hero` (parser not emulator; SSR'd content, nothing type-only; ArrowRight
not Tab; chips outside scrollback), and preserves all three locales.

## Decisions taken (with Zsolt, 2026-08-29)

| Decision | Choice |
|---|---|
| Hero layout | **Terminal is the whole first screen.** Name/headline/role live *inside* the window as the pre-run `whoami` output. Mitigation for the "blank prompt" recruiter failure: nothing is ever blank, a normal top nav with a CV button sits above the window. |
| Scope | Hero **+ whole site**: sidebar rail → top nav, design tokens, Reveal wipe retired, all sections restyled. Copy/content unchanged. |
| Look | Refined dark, one indigo accent (Linear / Raycast / Zed school). No scanlines, flicker, glitch, matrix, boot sequence, sounds. |
| Extras | ⌘K palette (reuses the terminal engine), fastfetch-style `whoami` card, generated covers for imageless projects. No live "uptime" metrics (only a real local clock + build commit). |

Research findings that shaped this (verified live sites + HN/dev.to hiring-side commentary):
kuber.studio (static fallback, machine-readable exports), iamdhakrey terminal (help/nav/status visible on
load, no dead end), smngvlkz.com (terminal as *typography*: status bar, `[> cta]` buttons), Linear/Raycast
token sheets (near-black canvas, 3–4 surface lifts, hairline `rgba(255,255,255,.08)`, no drop shadows,
accent reserved for prompt glyph / focus ring / primary CTA). Recruiters skim ~20 s and want names as text;
engineers judge authenticity of the simulation (sequential output) and mobile behaviour first.

## Design

### 1. Visual system (tokens)

CSS variables on `:root` in `src/styles/globals.css`, exposed through `tailwind.config.ts` `theme.extend.colors`
as `rgb(var(--x) / <alpha-value>)` so a light theme can be added later without touching components.

| Token | Value | Use |
|---|---|---|
| `canvas` | `#09090b` | page background (body) |
| `surface-1/2/3` | `#0f0f11` / `#141417` / `#1a1a1e` | window body / title bar & chips / hover |
| `line`, `line-strong` | `rgba(255,255,255,.08)` / `.14` | every border (hairlines only, no shadows) |
| `fg`, `fg-2`, `fg-3` | `#f4f4f5` / `#a1a1aa` / `#6b6b74` | primary / secondary / muted text |
| `accent`, `accent-hover`, `accent-soft` | `#6366f1` / `#818cf8` / `rgba(99,102,241,.12)` | prompt glyph, focus ring, primary CTA, links |
| `ok`, `warn` | `#34d399` / `#fbbf24` | status dot / terminal error tone |

Fonts: **Inter** (UI; `font-feature-settings: "cv11","ss01"`, headings `tracking-[-0.02em]`) and
**Recursive** with `MONO=1` (terminal + kickers + the hero name at a heavy weight). Recursive stays because it
is already wired, has `latin-ext` (SK/HU diacritics), and its casual-mono cut is more distinctive than JetBrains
Mono. Loaded in `_app.tsx` (globally, `preload: true`) since the hero now depends on it.

Backdrop behind the hero only: 24px dot grid at ~6% opacity + one radial indigo glow (top-centre, ~18%
opacity, 900px) + faint SVG `feTurbulence` noise at ~3%. Nothing animated.

Motion: `Reveal` keeps its props but becomes a 0.45 s fade-up (`opacity 0→1, y 12→0`), no wipe panel.
`prefers-reduced-motion` disables all of it (existing `useMotionCapabilities` contract).

### 2. Page skeleton

```
<TopNav>   sticky 56px · hairline bottom · backdrop-blur
           [V.]  About · Projects · Experience · Contact      [⌘K]  [EN ▾]  [CV ↓]
<Hero>     min-h-[calc(100svh-56px)]  — the terminal window, inset 24px on desktop, 8px on mobile
<About/> <Projects/> <Experience/> <Contact/>   (max-w-5xl, space-y-32 — unchanged rhythm)
<Footer>   © 2026 · built with Next.js · source ↗ · llms.txt
```
The `SideBar` and its 54px grid column are deleted. Scroll-spy moves to `TopNav` links (same
IntersectionObserver-on-`.section-wrapper` mechanism). On mobile the section links hide; the `⌘K` button
becomes a "menu" icon and opens the same palette, which lists the sections. `Header.tsx` is replaced, not
patched.

### 3. The window (hero)

```
┌ ● ● ●   zsolt@varju — ~/cv — zsh                               Read as a page ↓ ┐
│                                                                                  │
│ ❯ whoami                                                                         │
│                                                                                  │
│  ▛▀▀▜   ZSOLT VARJU                       ← h1, Recursive mono 800, clamp(2.25rem,5vw,3.5rem)
│  ▙▄▄▟   I delete work for a living.       ← headline, mono 500, fg-2, ~1.25rem
│                                                                                  │
│  role      Software Developer · full-stack + platform operator                  │
│  now       sole developer on a project for the European Space Agency            │
│  based     Prague, CET · EN · SK · HU                                            │
│  since     2022                                                                  │
│  stack     TypeScript · React · Next.js · Node · Python · Docker · Kubernetes    ← each → `find x`
│  status    ● open to new roles     [contact]  [cv ↓]                             ← buttons
│                                                                                  │
│ ❯ █  ghost-text                                                                  │
│ [about] [projects] [experience] [skills] [contact] [cv]      or click — no typing needed
├──────────────────────────────────────────────────────────────────────────────────┤
│ ~/cv  main@a1b2c3d          ↑↓ history · → accept · ^L clear         Prague 14:32 │
└──────────────────────────────────────────────────────────────────────────────────┘
```

- **Title bar**: traffic lights at low saturation (not grey dots, not toy colours), centred title
  `zsolt@varju — ~/cv — zsh`, right-aligned "Read as a page ↓" (existing `TerminalPageLink`).
  Boot banner block is dropped; its two sentences were redundant with the title.
- **`whoami`** is a NEW command and the new `DEMO_COMMAND`. It prints the card above: a CSS block-art
  monogram (an 8×8 grid of cells, accent-coloured, hidden < md), the name as the page `<h1>`, the headline
  as `<p>`, then a `<dl>` of key/value rows in mono. The `about` command keeps the prose. All rows are
  SSR'd as block 1 — crawlers and no-JS readers get name, role, summary, location, stack on first paint,
  exactly as today. `ReadableBand`, `HeroActions`, `Eyebrow` are deleted (their copy moves into the card).
- **Status row** actions: `[contact]` runs `contact`, `[cv ↓]` runs `cv`. Status text is a message key
  (`hero.terminal.status`) defaulting to "open to new roles" — Zsolt can soften/remove it in the JSON.
- **Sequential print**: output lines get a CSS stagger (`animation-delay: i × 18ms`, opacity+2px rise,
  capped at ~600 ms total). Any keypress/click sets a `data-instant` attribute that cancels it. The
  auto-demo continues to *type the command header only* over already-rendered output (current pattern).
- **Prompt**: `❯` glyph in accent (short — `visitor@zsoltvarju:~$` wasted 22 columns). Ghost text and
  `press → to accept` hint unchanged. Input stays `text-base` on mobile (iOS zoom).
- **Chips**: pill buttons on `surface-2`, hairline, accent border on hover/focus; permanently outside
  the scrollback. On mobile they become a single horizontally scrollable row with edge fade.
- **Status bar** (tmux-style, mono 11–12px, `fg-3`): left `~/cv  main@<short sha>` (sha from
  `NEXT_PUBLIC_COMMIT_SHA` set in `netlify.toml` from `$COMMIT_REF`, falls back to build date);
  centre keyboard hints (hidden < md); right Prague local time, client-only after mount (renders
  `--:--` on the server to avoid hydration mismatch), updated each minute.
- **Heights**: window `min-h-[calc(100svh-56px-48px)]`, scrollback `flex-1 overflow-y-auto`;
  on mobile the window is `min-h-[calc(100svh-56px-16px)]` and the key/value rows stack label-over-value.
  `100svh` (not `dvh`) so the on-screen keyboard does not resize the window while typing.

Engine rules preserved and re-verified in acceptance: reduced verb set; synonyms + Levenshtein; every noun
clickable; chips outside scrollback; ArrowRight accepts ghost text (Tab untouched); `whoami` output
present in the server HTML for all three locales.

### 4. ⌘K palette

Custom (~200 lines, no `cmdk` dependency): `⌘K` / `Ctrl+K` / the nav button opens a centred dialog
(`role="dialog"`, focus trap, Esc closes, arrow keys + Enter). Entries, grouped:
`Go to` (About/Projects/Experience/Contact), `Projects` (each opens `ProjectModal`), `Experience`
(scrolls to the job), `Terminal` (`whoami about projects skills … find <query>` → scrolls to the hero and
runs it there), `Actions` (Download CV, Copy email, Switch language EN/SK/HU). Filtering reuses
`suggest()`/`COMMANDS`/`SYNONYMS` from `commands.ts` plus substring match on titles.

Glue: a tiny `SiteBus` context (`src/components/bus/SiteBus.tsx`) with `runInTerminal(cmd)`,
`openProject(key)`, `openPalette()`. The terminal registers its `run`; `Projects` registers its modal
opener. This is the single shared interface between the hero, palette and sections work packages.

### 5. Sections (content unchanged)

- `SectionHeader`: mono kicker `01 / about` in `fg-3` + Inter heading, no hairline-rule row-reverse dance.
- **About**: keep the 2-col sticky layout; retire the indigo drop-cap box; facts row and skill groups on
  tokens; `CurrentlyCard` keeps its pulse dot.
- **Projects**: new `ProjectCover` — for cards without a screenshot, a generated tile: `surface-2`,
  subtle per-project hue shift (hash of title), faux title bar, project title in mono, tech line in `fg-3`.
  Real screenshots unchanged. "Learn more >" hardcoded English → translated key.
- **Experience**: mono dates column, hairline timeline; chips on tokens.
- **Contact**: card on tokens; email row gets copy-to-clipboard with a "Copied" state (rauno.me pattern).
- **Footer**: new, one line.
- `animejs` dependency removed (imported nowhere); `README.md` template text replaced by a short real one.

### 6. i18n

New keys (added to **all three** of `src/messages/{en,sk,hu}.json`): `hero.terminal.whoami.{role,now,based,
since,stack,status}` labels, `hero.terminal.status`, `hero.terminal.statusBar.{hints,cwd}`, `nav.*`
(section labels reuse `sidebar.*`; add `palette`, `menu`), `palette.*` (placeholder, groups, actions),
`projects.learnMore`, `footer.*`. SK/HU strings are Claude-written and must be flagged for Zsolt's native
read (memory `terminal-hero` already tracks this). Content constraints (memory `portfolio-content-
constraints`) apply: the `now` row uses the approved ESA phrasing verbatim from `hero.common.tagline`.

