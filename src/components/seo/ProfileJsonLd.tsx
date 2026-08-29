import Head from "next/head";
import { useRouter } from "next/router";
import { useTranslations } from "next-intl";

import type {
  Certification,
  ChipGroup,
  LanguageEntry,
  StackGroup,
} from "../about/types";
import type { Job } from "../experience/ExperienceItem";
import { PROJECTS } from "../projects/Projects";
import { HOME_COUNTRY_CODE, LANGUAGE_CODES, PERSON_ID, SITE_URL, localeUrl } from "./site";

/**
 * schema.org JSON-LD for the profile page.
 *
 * Why this exists: the AI crawlers that matter for "who is Zsolt Varju?" —
 * GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, PerplexityBot,
 * Meta-ExternalAgent — fetch raw HTML and do not execute JavaScript. The page
 * itself is statically generated so the prose already survives that, but
 * nothing tells a machine which string is the job title and which is the
 * employer. This does.
 *
 * Every value is read from the next-intl messages at render time. Nothing is
 * duplicated here, so the graph cannot drift away from the visible page, and
 * it says the same thing in whichever of the three languages is being served.
 * No claim is made here that a reader can't also see on the page.
 */

interface ProjectMessage {
  title: string;
  tech: string;
  description: string;
}

type Node = Record<string, unknown>;

/** Drops keys whose value is undefined or an empty array, so the emitted
 *  JSON has no null-ish noise for a model to trip over. */
const compact = (node: Node): Node =>
  Object.fromEntries(
    Object.entries(node).filter(
      ([, value]) =>
        value !== undefined &&
        value !== "" &&
        !(Array.isArray(value) && value.length === 0)
    )
  );

const dedupe = (values: string[]) => Array.from(new Set(values));

const splitTech = (tech: string) =>
  tech
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export const ProfileJsonLd = () => {
  const { locale = "en" } = useRouter();

  const meta = useTranslations("meta");
  const about = useTranslations("About");
  const stats = useTranslations("Stats");
  const experience = useTranslations("experience");
  const contact = useTranslations("Contact");
  const projects = useTranslations("projects");

  const stack = stats.raw("stack") as StackGroup[];
  const aiLlm = stats.raw("aiLlm") as ChipGroup;
  const certifications = stats.raw("certifications") as Certification[];
  const languages = stats.raw("languages") as LanguageEntry[];
  const jobs = experience.raw("jobs") as Job[];

  const pageUrl = localeUrl(locale);
  const pageId = `${pageUrl}#profilepage`;
  const websiteId = `${SITE_URL}/#website`;

  // `meta.title` is "Name | Role" in all three locales, and it is the only
  // place the display name lives — including the Hungarian name order.
  const name = meta("title").split("|")[0].trim();

  // "Prague, CZ" / "Praha, ČR" / "Prága, CZ" — locality is translated, the
  // country code is not (see HOME_COUNTRY_CODE).
  const locality = about("facts.basedValue").split(",")[0].trim();

  // Set at build time in next.config.mjs. Date-only, per the warning there:
  // never reformat it, and never fall back to `new Date()` — that would
  // differ between the server render and the client and break hydration.
  const buildDate = process.env.NEXT_PUBLIC_BUILD_TIME?.slice(0, 10);

  const person = compact({
    "@type": "Person",
    "@id": PERSON_ID,
    name,
    url: pageUrl,
    jobTitle: jobs[0]?.jobTitle,
    description: meta("description"),
    email: contact("email"),
    address: {
      "@type": "PostalAddress",
      addressLocality: locality,
      addressCountry: HOME_COUNTRY_CODE,
    },
    // Skills the page actually claims: the stack groups plus the AI/LLM
    // chips. `Stats.triedOut` is deliberately left out — it is labelled
    // "tried out / used in school" and overstating it here would be a lie
    // the page itself doesn't tell.
    knowsAbout: dedupe([
      ...stack.flatMap((group) => group.items),
      ...aiLlm.chips,
    ]),
    knowsLanguage: languages.map((language) =>
      compact({
        "@type": "Language",
        name: language.name,
        alternateName: LANGUAGE_CODES[language.name.toLowerCase()],
      })
    ),
    sameAs: [contact("linkedinUrl"), contact("githubUrl")],
    worksFor: jobs[0]
      ? compact({
          "@type": "Organization",
          name: jobs[0].companyName,
          address: {
            "@type": "PostalAddress",
            addressLocality: jobs[0].location,
          },
        })
      : undefined,
    hasOccupation: jobs.map((job) =>
      compact({
        "@type": "Occupation",
        name: job.jobTitle,
        occupationLocation: { "@type": "Place", name: job.location },
        // Verbatim from the messages, which is what the Experience section
        // renders. Titles already end in a colon.
        description: job.responsibilities
          .map((item) => `${item.title} ${item.description}`)
          .join(" "),
        skills: job.skills.join(", "),
      })
    ),
    // Dates are omitted on purpose: the messages carry them as "Apr 2025",
    // and schema.org wants an ISO date. They are in /cv.md instead.
    hasCredential: certifications.map((certification) => ({
      "@type": "EducationalOccupationalCredential",
      name: certification.name,
      credentialCategory: "certificate",
      recognizedBy: { "@type": "Organization", name: certification.issuer },
    })),
  });

  const projectNodes = PROJECTS.map((definition) => {
    const message = projects.raw(definition.key) as ProjectMessage;
    const tech = splitTech(message.tech);

    return compact({
      // Source is only claimed where a repository is actually public.
      "@type": definition.code ? "SoftwareSourceCode" : "CreativeWork",
      "@id": `${SITE_URL}/#project-${definition.key}`,
      name: message.title,
      description: message.description,
      keywords: tech.join(", "),
      programmingLanguage: definition.code ? tech : undefined,
      codeRepository: definition.code,
      url: definition.projectLink ?? definition.code,
      image: definition.imgSrc ? `${SITE_URL}${definition.imgSrc}` : undefined,
      inLanguage: locale,
      author: { "@id": PERSON_ID },
      mainEntityOfPage: { "@id": pageId },
    });
  });

  const graph = [
    compact({
      "@type": "WebSite",
      "@id": websiteId,
      url: `${SITE_URL}/`,
      name: meta("title"),
      description: meta("description"),
      inLanguage: locale,
      author: { "@id": PERSON_ID },
      publisher: { "@id": PERSON_ID },
    }),
    compact({
      "@type": "ProfilePage",
      "@id": pageId,
      url: pageUrl,
      name: meta("title"),
      description: meta("description"),
      inLanguage: locale,
      dateModified: buildDate,
      isPartOf: { "@id": websiteId },
      mainEntity: { "@id": PERSON_ID },
      about: { "@id": PERSON_ID },
      hasPart: projectNodes.map((node) => ({ "@id": node["@id"] })),
    }),
    person,
    ...projectNodes,
  ];

  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph })
    // A literal "<" inside a <script> body can end the element early. None of
    // the messages contain one today; this makes that stay true.
    .replace(/</g, "\\u003c");

  return (
    <Head>
      <script
        key="profile-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: json }}
      />
    </Head>
  );
};

export default ProfileJsonLd;
