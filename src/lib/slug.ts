/**
 * A slug a visitor could plausibly type, from a company name.
 *
 * Shared by the ⌘K palette (`usePaletteSources`, which keys each job row with
 * it), `ExperienceItem` (which names its row's anchor with it) and the
 * terminal's `useTerminalData` (whose `experience <key>` argument is this) —
 * they must agree, since the palette's "job" action scrolls to
 * `document.getElementById(jobSlug)`.
 */
export const slug = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").split("-")[0];
