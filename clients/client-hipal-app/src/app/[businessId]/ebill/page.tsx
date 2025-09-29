import EBill from "@/components/organisms/eBill";
import { fetchCommonData } from "../../../apis/commonApis";

// export const revalidate = 300;
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function generateMetadata() {
  return {
    title: "Ebill",
    description: "Ebill page for businesses",
  };
}

export default async function Page({
  params,
}: {
  params: { businessId: string };
}) {
  const { data } = await fetchCommonData(params.businessId);

  return <EBill data={data} />;
}
