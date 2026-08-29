import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { NextIntlClientProvider } from 'next-intl';
import { useRouter } from 'next/router';
import ScrollToTopButton from '@/components/ScrollToTopButton';
import { inter, recursive } from '@/lib/fonts';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <NextIntlClientProvider
      messages={pageProps.messages}
      locale={router.locale}
      // Fixed, not the visitor's zone: dates render identically on the server
      // and the client, so next-intl never warns about an ambiguous zone.
      timeZone="Europe/Prague"
    >
      {/* The font families go on :root rather than on a wrapper className.
          The project modal and the ⌘K palette portal into <body>, i.e.
          outside this tree — a class-based approach would leave them in
          system-ui. Tailwind's font-sans/font-mono read these two vars. */}
      <style jsx global>{`
        :root {
          --font-sans: ${inter.style.fontFamily};
          --font-mono: ${recursive.style.fontFamily};
        }
      `}</style>
      <div className={`${inter.variable} ${recursive.variable}`}>
        <Component {...pageProps} />
        <ScrollToTopButton />
      </div>
    </NextIntlClientProvider>
  );
}
