import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { NextIntlClientProvider } from 'next-intl';
import { useRouter } from 'next/router';
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"], display: 'swap' });


export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <NextIntlClientProvider 
      messages={pageProps.messages} 
      locale={router.locale} // Add this line
    >
            <main className={inter.className}>
        <Component {...pageProps} />
      </main>
    </NextIntlClientProvider>
  );
}