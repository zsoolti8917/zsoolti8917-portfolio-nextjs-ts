import { HomPage } from "@/components";
import { useTranslations } from 'next-intl';


export default function Home() {
  const t = useTranslations('Home');

  return (
    <>
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