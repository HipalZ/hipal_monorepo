import { redirect } from "next/navigation";
import LoadingSpinner from "@/components/atoms/progressBar/loadingSpinner";
import { getBusinessData } from "@/apis/commonApis";

export const revalidate = 300;

const Page = async ({ params, searchParams }: {
  params: { businessId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const businessData = await getBusinessData(params?.businessId);

  // Handle redirects based on outlet type
  if (["MENU", "FOOD", "OTHER"].includes(businessData?.outLetType)) {
    const queryString = new URLSearchParams()
    Object.entries(searchParams).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => queryString.append(key, v));
      } else if (value) {
        queryString.append(key, value);
      }
    });

    const redirectUrl = `/${params.businessId}/explore${queryString.toString() ? `?${queryString.toString()}` : ""
      }`;

    redirect(redirectUrl);
  }
  
  if(businessData?.outLetType === 'HOTEL'){
    const redirectUrl = `/${params.businessId}/hotel`;
    redirect(redirectUrl);
  }

  return <LoadingSpinner />;
};

export default Page;