import { HomPage } from "@/components";
import Head from "next/head";
import { useTranslations } from 'next-intl';
import { AlternateLinks, ProfileJsonLd } from "@/components/seo";
import {
  ALL_HERO_VARIANT_IDS,
  SHIPPED_VARIANT_ID,
} from "@/components/hero/shippedId";


export default function Home() {
  const t = useTranslations('meta');

  return (
    <>
      <Head>
        <title>{t('title')}</title>
        <meta name="description" content={t('description')} />
      </Head>
      {/* Beside <Head>, not inside it: next/head collects its children as
          unevaluated elements and renders them later in _document, outside
          NextIntlClientProvider — so a child calling useTranslations throws.
          These each render their own <Head>, which Next merges. */}
      <ProfileJsonLd />
      <AlternateLinks />
      <HomPage />
    </>
  );
}

export async function getStaticProps({locale}: {locale: string}) {
  const raw = (await import(`../messages/${locale}.json`)).default as Record<string, any>;

  // Splitting the variant COMPONENTS out of the production bundle isn't
  // enough on its own: next-intl serialises the whole message tree into the
  // page payload, so the copy for the four heroes that don't ship would ride
  // along in every page load (~1.9 kB of the ~28 kB payload). Shallow-clone
  // rather than mutate — the imported JSON module is cached and shared across
  // locales and across requests.
  const messages = { ...raw, hero: { ...raw.hero } };
  if (process.env.NODE_ENV !== 'development') {
    for (const id of ALL_HERO_VARIANT_IDS) {
      if (id !== SHIPPED_VARIANT_ID) delete messages.hero[`t${id}`];
    }
  }

  return { props: { messages } };
}
