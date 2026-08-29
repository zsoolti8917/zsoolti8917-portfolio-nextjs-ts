/**
 * Canonical origin for every absolute URL this site emits. Confirmed against
 * `src/pages/_document.tsx`, which loads a self-hosted umami script from it.
 *
 * `scripts/build-llm-assets.mjs` repeats this constant — a plain `.mjs` build
 * script can't import a `.ts` module — so change the two together.
 */
export const SITE_URL = "https://zsoltvarjuprojects.com";

/**
 * Deliberately stable across locales: `/`, `/sk` and `/hu` are three language
 * versions of one person, so every locale's graph points at the same node and
 * a consumer can merge them.
 */
export const PERSON_ID = `${SITE_URL}/#person`;

/** `en` is the default locale and carries no path prefix (next.config.mjs). */
export const localeUrl = (locale: string) =>
  locale === "en" ? `${SITE_URL}/` : `${SITE_URL}/${locale}`;

/**
 * ISO 639-1 codes for the language names in `Stats.languages`, which are
 * themselves translated ("Hungarian" / "Maďarčina" / "Magyar"). Lookup is
 * lower-cased; a name that isn't in here emits no `alternateName` at all
 * rather than a guessed code.
 */
export const LANGUAGE_CODES: Record<string, string> = {
  hungarian: "hu",
  "maďarčina": "hu",
  magyar: "hu",
  slovak: "sk",
  "slovenčina": "sk",
  "szlovák": "sk",
  czech: "cs",
  "čeština": "cs",
  cseh: "cs",
  english: "en",
  "angličtina": "en",
  angol: "en",
};

/**
 * ISO 3166-1 alpha-2 for the country in `About.facts.basedValue`, which is
 * translated per locale ("Prague, CZ" / "Praha, ČR" / "Prága, CZ"). The
 * locality is read from the message; only the country is fixed here, because
 * schema.org's `addressCountry` wants a code and "ČR" is not one.
 */
export const HOME_COUNTRY_CODE = "CZ";
