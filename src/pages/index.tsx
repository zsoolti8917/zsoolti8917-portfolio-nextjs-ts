import { Inter } from "next/font/google";
import { HomPage } from "@/components";
import { useTranslations } from 'next-intl';

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const t = useTranslations('Home');

  return (
    <main className={inter.className}>
      <HomPage />
    </main>
  );
}

export async function getStaticProps({locale}: {locale: string}) {
  return {
    props: {
      messages: (await import(`../messages/${locale}.json`)).default
    }
  };
}