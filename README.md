# zsoltvarju.com

The personal site and portfolio of Zsolt Varjú — software developer and platform
operator. Next.js 14 (pages router), TypeScript, Tailwind, framer-motion,
`next-intl`. Deployed on Netlify.

## Scripts

```bash
npm run dev        # local dev server on :3000
npm run build      # production build (this is the gate — keep it green)
npm test           # vitest, unit tests only
npm run lint       # next lint
npm run cv:build   # regenerate the three CV PDFs from cv/content.<locale>.json
npm run llm:build  # regenerate public/llms.txt and public/cv.md
```

## Locales

Three: `en`, `sk`, `hu`. All copy lives in `src/messages/{en,sk,hu}.json`, and
every key must exist in all three files — a missing key is a runtime error, not
a fallback. CV copy lives separately in `cv/content.{en,sk,hu}.json` and the two
must not contradict each other (`npm run cv:verify` checks the CVs).

## The hero

The first screen is an interactive terminal rather than a headline: a small,
announced command set (`whoami`, `about`, `projects`, `skills`, `contact`, `cv`,
`find <query>`) with synonyms and typo tolerance, clickable chips outside the
scrollback, and every printed noun clickable. It is progressive enhancement, not
a gate — the server renders the `whoami` card and the command output as real
HTML, so a recruiter with a slow connection and a crawler that never executes
JavaScript both get the full content on first paint. Nothing may become
reachable only by typing.

## Docs

The current design spec is in
[`docs/superpowers/specs/`](docs/superpowers/specs/) —
`2026-08-29-terminal-hero-redesign-design.md` covers the tokens, the page
skeleton, the terminal window, the ⌘K palette and the section restyle.
