"use client";
import React, { memo } from "react";
import { GOOGLE_ANALYTICS } from "@/configs";
import { useParams } from "next/navigation";
import Script from "next/script";

const MemoGoogleAnalytics = () => {
  const params = useParams();
  const businessId = params?.businessId as string;

  return (
    <>
      <Script
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS}`}
      />

      <Script id="ga-script" strategy="lazyOnload">
        {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GOOGLE_ANALYTICS}', {
              page_path: window.location.pathname,
            });

            // Send the Business ID as an event parameter
            gtag('event', 'page_view', {
              'businessId': '${businessId}',
            });
          `}
      </Script>
    </>
  );
};

const GoogleAnalytics = memo(MemoGoogleAnalytics);
export default GoogleAnalytics;
