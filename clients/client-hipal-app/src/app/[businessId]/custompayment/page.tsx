import { businessApis } from "@/apis/explore";
import CustomPayPage from "@/components/templates/customPay";
import { BusinessDetails } from "@/components/types/businessData";
import { apiRpc } from "@hi/common";

export const revalidate = 300;

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
          title: "Payment",
          description: "Quick payment page for our customers",
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
    description: "Explore page for businesses",
  };
}

export default async function Page({
  params,
}: { params: { businessId: string } }) {
  const data = await businessApis.all(params.businessId);
  return <CustomPayPage data={data} />;
}
