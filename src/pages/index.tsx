import { HomPage } from "@/components";
import Head from "next/head";
import { useTranslations } from 'next-intl';


export default function Home() {
  const t = useTranslations('meta');

  return (
    <>
      <Head>
        <title>{t('title')}</title>
        <meta name="description" content={t('description')} />
      </Head>
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
