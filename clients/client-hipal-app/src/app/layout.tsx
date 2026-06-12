import type { Metadata } from "next";
import { Ubuntu } from "next/font/google";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import Loading from "./loading";
import "./globals.css";
import { BusinessDetails } from "@/components/types/businessData";
import { apiRpc } from "@hi/common";
// import AutoLoginWrapper from "@/components/AutoLoginWrapper.jsx";
const DynamicThemes = dynamic(
  () => import("@/components/atoms/dynamicThemes"),
  { ssr: false },
);
const DynamicScanPage = dynamic(
  () => import("@/components/atoms/dynamicScanPage"),
  {
    ssr: false,
  },
);

const AutoLoginWrapper = dynamic(
  () => import("@/components/AutoLoginWrapper"),
  {
    ssr: false,
  },
);

const VisitPing = dynamic(() => import("@/components/VisitPing"), {
  ssr: false,
});
const DynamicInternetConnection = dynamic(
  () => import("@/components/atoms/internetConnection"),
  {
    ssr: false,
  },
);

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

const DynamicCombinedLogin = dynamic(
  () => import("@/components/atoms/dynamicCombinedLogin"),
  {
    ssr: false,
  },
);

const DynamicSessionOut = dynamic(
  () => import("@/components/atoms/sessionTimedOut"),
  {
    ssr: false,
  },
);

const ErrorPopupComponent = dynamic(
  () => import("@/components/atoms/ErrorPopup"),
  {
    ssr: false,
  },
);

export async function generateMetadata({
  params,
}: {
  params: { businessId: string };
}) {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  const { businessId } = params;

  if (!objectIdRegex.test(businessId)) {
    try {
      const res = await apiRpc.businesses.n[":customLink"].$get({
        param: { customLink: businessId },
      });
      const response = (await res.json()) as {
        data: BusinessDetails;
        message: string;
        error: boolean;
      };

      const businessData = response?.data;
      if (!businessData) {
        return {
          title: "Explore",
          description: "Explore page for businesses",
        };
      }

      const { name, description, logoUrl } = businessData;
      const metaDescription = description || "Explore our business offerings!";

      return {
        title: name,
        description: metaDescription,
        icons: {
          icon: logoUrl,
        },
        openGraph: {
          title: name,
          description: metaDescription,
          images: [
            {
              url: logoUrl || "https://example.com/fallback-image.jpg",
              width: 1200,
              height: 630,
              alt: name,
            },
          ],
          type: "website",
        },
      };
    } catch (error) {
      console.error("Error fetching business metadata:", error);
    }
  }

  return {
    title: "Explore",
    description: "Explore our businesses",
  };
}

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
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap"
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
        <link
          href="https://fonts.googleapis.com/css2?family=DotGothic16&display=swap"
          rel="stylesheet"
        />
        <GoogleAnalytics />
      </head>

      <body className={`${ubuntu.className}`}>
        <Suspense fallback={<Loading />}>
          <section className="relative !z-[9999]">
            {/* <DynamicInternetConnection /> */}
            <DynamicToast />
          </section>
          <DynamicQueryComponent>
            <div id="root">
              {children}
              <AutoLoginWrapper />
              <VisitPing />
              <DynamicCombinedLogin />
            </div>
          </DynamicQueryComponent>
          <DynamicScanPage />
          <DynamicSessionOut />
          <DynamicThemes />
          <ErrorPopupComponent />
        </Suspense>
      </body>
    </html>
  );
}
