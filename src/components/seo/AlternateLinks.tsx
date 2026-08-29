import Head from "next/head";

/**
 * Advertises the machine-readable copies of this site to anything reading the
 * raw HTML. A crawler that does not run JavaScript still gets a pointer to a
 * plain-text index, the whole CV as markdown, and a structured profile —
 * none of which it would otherwise know exist.
 *
 * Root-relative on purpose: these three files sit at the origin root and are
 * English regardless of which locale path served the page.
 *
 * Regenerate the targets with `npm run llm:build`.
 */
export const AlternateLinks = () => (
  <Head>
    <link
      key="alt-llms"
      rel="alternate"
      type="text/plain"
      href="/llms.txt"
      title="llms.txt — index for language models"
    />
    <link
      key="alt-cv"
      rel="alternate"
      type="text/markdown"
      href="/cv.md"
      title="Full CV in Markdown"
    />
    <link
      key="alt-profile"
      rel="alternate"
      type="application/json"
      href="/profile.json"
      title="Machine-readable profile"
    />
  </Head>
);

export default AlternateLinks;
