import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html>
      <Head />
      {/* id="root" is the portal target for the project modal and the palette. */}
      <body id="root" className="bg-canvas text-fg font-sans antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
