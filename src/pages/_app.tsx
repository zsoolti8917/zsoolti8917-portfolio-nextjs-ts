import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { NextIntlClientProvider } from 'next-intl';
import { useRouter } from 'next/router';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <NextIntlClientProvider 
      messages={pageProps.messages} 
      locale={router.locale} // Add this line
    >
      <Component {...pageProps} />
    </NextIntlClientProvider>
  );
}