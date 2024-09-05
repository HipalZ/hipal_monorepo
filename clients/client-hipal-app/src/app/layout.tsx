import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import Loading from "./loading";
import "./globals.css";

const DynamicToast = dynamic(
  () => import("@/components/atoms/toastContainer"),
  { ssr: false },
);
const DynamicQueryComponent = dynamic(
  () => import("@/components/atoms/queryComponent"),
);

const GoogleAnalytics = dynamic(
  () => import("@/components/atoms/dynamicGoogleAnalytics"),
);

export const metadata: Metadata = {
  title: "Hipal App",
  description: "Menu Application for Restaurants",
};

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
        <GoogleAnalytics />
      </head>
      <body>
        <Suspense fallback={<Loading />}>
          <DynamicToast />
          <DynamicQueryComponent>
            <div id="root">{children}</div>
          </DynamicQueryComponent>
        </Suspense>
      </body>
    </html>
  );
}
