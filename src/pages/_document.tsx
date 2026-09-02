import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html>
      {/* Locale-independent head only — anything translated lives in the
          per-page <Head> components (see pages/index.tsx). */}
      <Head>
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#09090b" />
        {/* util/Reveal SSRs an inline opacity:0 that only an effect undoes —
            without JavaScript the prose would stay invisible. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </Head>
      {/* id="root" is the portal target for the project modal and the palette. */}
      <body id="root" className="bg-canvas text-fg font-sans antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
