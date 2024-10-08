import { Html, Head, Main, NextScript } from "next/document";
import Script
 from "next/script";
export default function Document() {
  console.log("Custom Document is being used");

  return (
    <Html lang="en">
              <Head>
                
              <Script
  src="https://zsoltvarjuprojects.com/script.js"
  data-website-id="6d6ae2f3-05ec-414d-9ab7-9e973974e4d0"
  strategy="afterInteractive"
/>
          <link
            href="https://fonts.googleapis.com/css2?family=Inter&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body id="root" className="bg-zinc-900 text-zinc-50">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
