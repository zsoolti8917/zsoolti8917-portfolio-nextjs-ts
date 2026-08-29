# CV source

Generates `public/Varju-CV-{EN,HU,SK}.pdf` (and `.txt`) from structured content.
Before this existed, the CVs were opaque Canva exports with no source — the only
way to change a word was to re-export by hand, and the PDFs silently drifted out
of sync with the site copy in `src/messages/*.json`.

```bash
node cv/build.mjs          # all three locales
node cv/build.mjs en       # just one
node cv/verify.mjs         # assert the output survives automated screening
```

`build.mjs` needs Google Chrome. Override its location with `CHROME_PATH`.

Output filenames are fixed, because `getCVUrl()` in
`src/lib/cv.ts` maps locale → filename.

## Files

| file | role |
|---|---|
| `content.{en,hu,sk}.json` | all copy — **edit this, not the HTML** |
| `template.mjs` | renders content → print HTML and plain text |
| `cv.css` | standalone print stylesheet (never import Tailwind or `globals.css` here) |
| `fonts/` | Source Sans 3, WOFF2, weights 400/600/700 (SIL OFL) |
| `build.mjs` | render → serve over localhost → Chrome print-to-PDF |
| `extract.js` | JXA/PDFKit: pulls a PDF's text layer two different ways |
| `verify.mjs` | the acceptance tests |
| `render.{en,hu,sk}.html` | build artifacts, gitignored |

Content is kept separate from `src/messages/*.json` on purpose: the site and the
CV say similar things but have very different length budgets. When you change a
job or a project, update both.

## Why the layout looks the way it does

A PDF's content stream carries no logical structure. Text extractors either
replay stream order or re-sort glyphs by position, and on a multi-column page
those two strategies disagree. **A single column is the only layout where both
return the same, correct answer** — that is the entire reason this template has
no sidebar.

The previous two-column CVs demonstrated the failure concretely. Sorted
geometrically, `Varju-CV-EN.pdf` used to extract as:

```
Mgr. Zsolt Varú Fr o n e ndD e ve l o p r Expriecd WebTeste with fesh Master's egre
Contactxperienes.Experiec 0
ail zsolt.varju.rl@gmailmanual tests to identify bugs across browsers and device
```

The sidebar and the main column sat at the same vertical positions and merged
line by line. Worse, Canva had baked `letter-spacing` into the text layer, so the
job title extracted as `F r o n t e n d   D e v e l o p e r` — a search or
embedding match for "Frontend Developer" returned *nothing*.

### Rules the template follows

1. One geometric column. Nothing side by side, ever.
2. No `letter-spacing`, `word-spacing`, `text-transform`, or small-caps.
3. No `position: absolute`, `float`, or flex `order` on anything with text —
   they move content to the end of the content stream.
4. Every section has a plain conventional heading on its own line, directly
   above its content. `Projects`, never `Projects - www.zsoltvarju.com`.
5. Dates on one line under the employer, containing nothing but the date range.
6. No photo. Embedded images are a documented parse-failure cause, and CZ/SK
   treat a CV photo as optional.
7. No icon fonts, emoji, skill bars, chips, SVG text, or layout tables.
8. **Visual structure from borders and colour only.** Headless Chrome's
   `printBackground` defaults to `false`, so `background-color` does not print.
   The hairline under each `h2` does the job a filled panel would.
9. Link text is the readable URL — link annotations are invisible to most
   extractors.
10. Never hide keywords: no white text, no `font-size: 0`, no prompt injection.

## What `verify.mjs` checks

Per locale: one page; the name is the first text in the document; the role is a
contiguous matchable token (this is the check that catches a `letter-spacing`
regression); the current employer follows the role within 400 characters; every
section heading survived; the new e-mail is present and the old one is gone; no
replacement or private-use glyphs; diacritics intact.

The headline check is **word-order similarity** between the two extractions.
It is a ratio rather than exact equality because PDFKit's
`characterBoundsAtIndex` is unreliable on Chrome-generated PDFs — it reports
glyph heights of 0.0–8.3pt for characters on the same baseline, and decomposed
Slovak diacritics (`ŕ`, `ď`, `ľ`) land at offsets that don't match their
character index. That noise is present regardless of layout. Column
interleaving, by contrast, reorders whole phrases.

Measured on this repo:

| layout | similarity |
|---|---|
| single column (these CVs) | 0.859 – 0.867 |
| two column (the old Canva CVs) | 0.643 – 0.688 |

The threshold is 0.78, sitting in the empty middle. If a future edit
reintroduces side-by-side text, this check fails.

## Fitting one page

HU and SK run 10–20% longer than EN. Levers, in order of preference:

1. **Trim the content** in `content.*.json`. Caps: summary ≤ 45 words, ≤ 4
   bullets per job, ≤ 2 rendered lines per bullet, 4 projects. This is the only
   lever that also improves the CV.
2. The `--fs` / `--lh` / `--gap` custom properties in `cv.css`, overridden per
   locale under `html[lang="sk"], html[lang="hu"]`. Floor is 9pt.
3. Never `transform: scale()`.

## Fonts

`fonts/` holds Source Sans 3 (SIL OFL) as WOFF2, latin + latin-ext subsets for
weights 400/600/700. To refresh:

```bash
base="https://cdn.jsdelivr.net/npm/@fontsource/source-sans-3@5.2.5/files"
for w in 400 600 700; do for sub in latin latin-ext; do
  curl -sSL -o "cv/fonts/source-sans-3-${sub}-${w}-normal.woff2" \
    "$base/source-sans-3-${sub}-${w}-normal.woff2"
done; done
```

The build serves the template over `http://127.0.0.1` rather than `file://`,
because headless Chrome is unreliable about loading self-hosted fonts from
`file://`.
