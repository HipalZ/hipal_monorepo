import { loyaltyApis } from "@/apis/loyalty";
import LoyaltyCardPage from "@/components/templates/loyalty";
import type { BusinessDetails } from "@/components/types/businessData";
import { apiRpc } from "@hi/common";

// export const dynamic = "force-dynamic";
// export const fetchCache = "force-no-store";

export const revalidate = 30;

export async function generateMetadata({
  params,
}: {
  params: { businessId: string };
}) {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  const { businessId } = params;

  // When businessId is not a valid ObjectId, treat it as a custom link and call the API.
  if (!objectIdRegex.test(businessId)) {
    const res = await apiRpc.businesses.n[":customLink"].$get({
      param: { customLink: businessId },
    });
    const response = (await res.json()) as unknown as {
      data: BusinessDetails;
      message: string;
      error: boolean;
    };

    const businessData = response?.data;
    const { name, description, logoUrl } = businessData;
    const metaDescription = description || "Welcome to our business offerings!";

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
  }

  return {
    title: "Loyalty",
    description: "Loyalty page for businesses",
  };
}

export default async function Page({
  params,
}: { params: { businessId: string } }) {
  const data = await loyaltyApis.all(params.businessId);
  return <LoyaltyCardPage data={data} />;
}
