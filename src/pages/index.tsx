import { HomPage } from "@/components";
import Head from "next/head";
import { useTranslations } from 'next-intl';
import { AlternateLinks, HeadMeta, ProfileJsonLd } from "@/components/seo";


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
      <HeadMeta />
      <ProfileJsonLd />
      <AlternateLinks />
      <HomPage />
    </>
  );
}

export async function getStaticProps({locale}: {locale: string}) {
  return {
    props: {
      messages: (await import(`../messages/${locale}.json`)).default
    }
  };
}
