import Head from "next/head";
import { useRouter } from "next/router";
import { useTranslations } from "next-intl";

import { SITE_URL, localeUrl } from "./site";

const LOCALES = ["en", "sk", "hu"] as const; // mirrors next.config.mjs i18n.locales

/** Open Graph wants a full locale tag, not the bare ISO 639-1 code. */
const OG_LOCALES: Record<string, string> = {
  en: "en_US",
  sk: "sk_SK",
  hu: "hu_HU",
};

/**
 * Per-locale head metadata: canonical, hreflang, Open Graph and Twitter card.
 * Rendered beside the page's own <Head>, never inside it — see the comment in
 * pages/index.tsx: next/head children render outside NextIntlClientProvider,
 * so a component calling useTranslations must own its <Head>.
 *
 * Every tag carries an explicit `key`: next/head dedupes by key, and without
 * distinct keys the two og:locale:alternate entries collapse into one.
 */
export const HeadMeta = () => {
  const { locale = "en" } = useRouter();
  const t = useTranslations("meta");

  const pageUrl = localeUrl(locale);
  // Same derivation as ProfileJsonLd: `meta.title` is "Name | Role" and is
  // the only place the display name lives, including the Hungarian order.
  const siteName = t("title").split("|")[0].trim();
  const imageUrl = `${SITE_URL}/og.png`; // og:image must be absolute

  return (
    <Head>
      <link key="canonical" rel="canonical" href={pageUrl} />
      {LOCALES.map((code) => (
        <link
          key={`hreflang-${code}`}
          rel="alternate"
          hrefLang={code}
          href={localeUrl(code)}
        />
      ))}
      <link
        key="hreflang-x-default"
        rel="alternate"
        hrefLang="x-default"
        href={localeUrl("en")}
      />

      <meta key="og-type" property="og:type" content="profile" />
      <meta key="og-title" property="og:title" content={t("title")} />
      <meta
        key="og-description"
        property="og:description"
        content={t("description")}
      />
      <meta key="og-url" property="og:url" content={pageUrl} />
      <meta key="og-site-name" property="og:site_name" content={siteName} />
      <meta key="og-locale" property="og:locale" content={OG_LOCALES[locale]} />
      {LOCALES.filter((code) => code !== locale).map((code) => (
        <meta
          key={`og-locale-alt-${code}`}
          property="og:locale:alternate"
          content={OG_LOCALES[code]}
        />
      ))}
      <meta key="og-image" property="og:image" content={imageUrl} />
      <meta key="og-image-width" property="og:image:width" content="1200" />
      <meta key="og-image-height" property="og:image:height" content="630" />
      <meta
        key="og-image-alt"
        property="og:image:alt"
        content={t("ogImageAlt")}
      />

      <meta
        key="twitter-card"
        name="twitter:card"
        content="summary_large_image"
      />
      <meta key="twitter-title" name="twitter:title" content={t("title")} />
      <meta
        key="twitter-description"
        name="twitter:description"
        content={t("description")}
      />
      <meta key="twitter-image" name="twitter:image" content={imageUrl} />
    </Head>
  );
};

export default HeadMeta;
