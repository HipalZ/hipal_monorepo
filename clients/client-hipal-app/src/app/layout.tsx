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
