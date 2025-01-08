import type { Metadata } from "next";
import { Ubuntu } from "next/font/google";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import Loading from "./loading";
import "./globals.css";
const DynamicScanPage = dynamic(() => import("@/components/atoms/dynamicScanPage"), {
  ssr: false,
});

const DynamicToast = dynamic(
  () => import("@/components/atoms/toastContainer"),
  { ssr: false },
);
const DynamicQueryComponent = dynamic(
  () => import("@/components/atoms/queryComponent"),
  { ssr: false },
);

const GoogleAnalytics = dynamic(
  () => import("@/components/atoms/dynamicGoogleAnalytics"),
  { ssr: false },
);

const DynamicCombinedLogin = dynamic(() => import("@/components/atoms/dynamicCombinedLogin"), {
  ssr: false,
});

export const metadata: Metadata = {
  title: "Hipal App",
  description: "Menu Application for Businesses",
  icons: {
    icon: [
      {
        rel: "icon",
        type: "image/ico",
        url: "/favicon/favicon.ico",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        url: "/apple-touch-icon.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        url: "/favicon-16x16.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        url: "/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "192x192",
        url: "/android-chrome-192x192.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "512x512",
        url: "/android-chrome-512x512.png",
      },
    ],
  },

  manifest: "/manifest.json",
};

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="facebook-domain-verification"
          content="1kbkpz82zpbnb9b7vusp4insjirtu8"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bungee+Inline&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&display=swap"
          rel="stylesheet"
        />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap" rel="stylesheet" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
          rel="stylesheet"
        />
        <GoogleAnalytics />
      </head>

      <body className={`${ubuntu.className}`}>
        <Suspense fallback={<Loading />}>
          <section className="relative !z-[9999]">
            <DynamicToast />
          </section>
          <DynamicQueryComponent>
            <div id="root">{children}</div>
          </DynamicQueryComponent>
          <DynamicCombinedLogin />
          <DynamicScanPage />
        </Suspense>
      </body>
    </html>
  );
}
