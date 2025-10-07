import { redirect } from "next/navigation";
import LoadingSpinner from "@/components/atoms/progressBar/loadingSpinner";
import { getBusinessData } from "@/apis/commonApis";
import { apiRpc } from "@hi/common";
import type { BusinessDetails } from "@/components/types/businessData";

// export const revalidate = 300;
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export async function generateMetadata({
  params,
}: {
  params: { businessId: string };
}) {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  const { businessId } = params;

  if (!objectIdRegex.test(businessId)) {
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
  }

  return {
    title: "Explore",
    description: "Explore page for businesses",
  };
}

const Page = async ({
  params,
  searchParams,
}: {
  params: { businessId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const businessData = await getBusinessData(params?.businessId);

  // Handle redirects based on outlet type
  if (["MENU", "FOOD", "RESTAURANT"].includes(businessData?.outLetType)) {
    const queryString = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (Array.isArray(value)) {
        for (const v of value) {
          queryString.append(key, v);
        }
      } else if (value) {
        queryString.append(key, value);
      }
    }

    const redirectUrl = `/${params.businessId}/explore${
      queryString.toString() ? `?${queryString.toString()}` : ""
    }`;

    redirect(redirectUrl);
  }
  if (businessData?.outLetType === "OTHER") {
    const reDirectUrl = `/${params.businessId}/o`;
    redirect(reDirectUrl);
  }

  if (businessData?.outLetType === "HOTEL") {
    const redirectUrl = `/${params.businessId}/hotel`;
    redirect(redirectUrl);
  }

  if (businessData?.outLetType === "JEWELLERY") {
    const redirectUrl = `/${params.businessId}/j`;
    redirect(redirectUrl);
  }

  return <LoadingSpinner />;
};

export default Page;
