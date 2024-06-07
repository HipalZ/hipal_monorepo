import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" className="!scroll-smooth ease-in-out" data-theme="light">
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />

        <link
          rel="apple-touch-startup-image"
          href="/apple-splash-2048-2732.jpg"
          sizes="2048x2732"
        />
        <link
          rel="apple-touch-startup-image"
          href="/apple-splash-1668-2388.jpg"
          sizes="1668x2388"
        />
        <link
          rel="apple-touch-startup-image"
          href="/apple-splash-1536-2048.jpg"
          sizes="1536x2048"
        />
        <link
          rel="apple-touch-startup-image"
          href="/apple-splash-1125-2436.jpg"
          sizes="1125x2436"
        />
        <link
          rel="apple-touch-startup-image"
          href="/apple-splash-1242-2208.jpg"
          sizes="1242x2208"
        />
        <link
          rel="apple-touch-startup-image"
          href="/apple-splash-750-1334.jpg"
          sizes="750x1334"
        />
        <link
          rel="apple-touch-startup-image"
          href="/apple-splash-640-1136.jpg"
          sizes="640x1136"
        />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
        <link
          href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@300;400;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        {/* <!-- Google Tag Manager (noscript) --> */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-57HCB68"
            height="0"
            width="0"
            className="hidden"
          ></iframe>
        </noscript>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
