import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import QueryComponent from "@/components/atoms/queryComponent";
import Loading from "./loading";
import "./globals.css";
import { BusinessDetails } from "@/components/types/businessData";
import { apiRpc } from "@hi/common";
// import AutoLoginWrapper from "@/components/AutoLoginWrapper.jsx";
const DynamicThemes = dynamic(
  () => import("@/components/atoms/dynamicThemes"),
  { ssr: false }
);
const DynamicScanPage = dynamic(
  () => import("@/components/atoms/dynamicScanPage"),
  {
    ssr: false,
  }
);

const AutoLoginWrapper = dynamic(
  () => import("@/components/AutoLoginWrapper"),
  {
    ssr: false,
  }
);

const VisitPing = dynamic(() => import("@/components/VisitPing"), {
  ssr: false,
});
const DynamicInternetConnection = dynamic(
  () => import("@/components/atoms/internetConnection"),
  {
    ssr: false,
  }
);

const DynamicToast = dynamic(
  () => import("@/components/atoms/toastContainer"),
  { ssr: false }
);
const GoogleAnalytics = dynamic(
  () => import("@/components/atoms/dynamicGoogleAnalytics"),
  { ssr: false }
);

const DynamicCombinedLogin = dynamic(
  () => import("@/components/atoms/dynamicCombinedLogin"),
  {
    ssr: false,
  }
);

const DynamicSessionOut = dynamic(
  () => import("@/components/atoms/sessionTimedOut"),
  {
    ssr: false,
  }
);

const DynamicSessionExpiredBlocker = dynamic(
  () => import("@/components/atoms/sessionExpiredBlocker"),
  {
    ssr: false,
  }
);

const ErrorPopupComponent = dynamic(
  () => import("@/components/atoms/ErrorPopup"),
  {
    ssr: false,
  }
);

const DEFAULT_METADATA: Metadata = {
  title: {
    default: "Hipal App - Menu Application for Businesses",
    template: "%s | Hipal App",
  },
  description:
    "Menu Application for Businesses - Transform your business with HipalZ's digital menu solution. Improve customer engagement, streamline operations, and enhance your business presence.",
  keywords: [
    "digital menu",
    "business menu app",
    "restaurant menu",
    "HipalZ",
    "Hipal App",
    "menu application",
    "customer engagement",
    "business solutions",
  ],
  authors: [{ name: "Paltribe Solutions PVT Ltd" }],
  creator: "HipalZ",
  publisher: "Paltribe Solutions PVT Ltd",

  // Open Graph metadata for social sharing
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://hipalz.com",
    siteName: "Hipal App",
    title: "Hipal App - Menu Application for Businesses",
    description:
      "Menu Application for Businesses - Transform your business with HipalZ's digital menu solution. Improve customer engagement, streamline operations, and enhance your business presence.",
    images: [
      {
        url: "/app-icon-512x512.png",
        width: 512,
        height: 512,
        alt: "Hipal App Logo",
      },
    ],
  },
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
        url: "/app-icon-192x192.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "512x512",
        url: "/app-icon-512x512.png",
      },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  manifest: "/manifest.json",
};

export async function generateMetadata({
  params,
}: {
  params: { businessId: string };
}): Promise<Metadata> {
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
        return DEFAULT_METADATA;
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
    ...DEFAULT_METADATA,
    title: "Explore",
    description: "Explore our businesses",
  };
}

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html:
              "html,body{min-height:100%;background:#F8F4EF!important;}#root{min-height:100dvh;background:#F8F4EF;}",
          }}
        />
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

      <body className={`${plusJakartaSans.className}`}>
        <Suspense fallback={<Loading />}>
          <section className="relative !z-[9999]">
            {/* <DynamicInternetConnection /> */}
            <DynamicToast />
          </section>
          <QueryComponent>
            <div id="root">
              {children}
              <AutoLoginWrapper />
              <VisitPing />
              <DynamicCombinedLogin />
            </div>
          </QueryComponent>
          <DynamicScanPage />
          <DynamicSessionOut />
          <DynamicSessionExpiredBlocker />
          <DynamicThemes />
          <ErrorPopupComponent />
        </Suspense>
      </body>
    </html>
  );
}
