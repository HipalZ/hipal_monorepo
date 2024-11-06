import type { Metadata } from "next";
import { Ubuntu } from "next/font/google";
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

      <body className={`${ubuntu.className} antialiased`}>
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
