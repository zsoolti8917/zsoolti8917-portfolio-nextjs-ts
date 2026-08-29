/**
 * A slug a visitor could plausibly type, from a company name.
 *
 * Shared by the ⌘K palette (`usePaletteSources`, which keys each job row with
 * it) and `ExperienceItem` (which names its row's anchor with it) — the two
 * must agree, since the palette's "job" action scrolls to
 * `document.getElementById(jobSlug)`.
 */
export const slug = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").split("-")[0];
