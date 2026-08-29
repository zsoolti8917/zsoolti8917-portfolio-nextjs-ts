import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

export default function Document() {
  return (
    <Html>
      <Head>
        <Script
          src="https://zsoltvarjuprojects.com/script.js"
          data-website-id="6d6ae2f3-05ec-414d-9ab7-9e973974e4d0"
          strategy="afterInteractive"
        />
      </Head>
      {/* id="root" is the portal target for the project modal and the palette. */}
      <body id="root" className="bg-canvas text-fg font-sans antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
