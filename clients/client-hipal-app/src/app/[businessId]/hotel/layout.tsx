import { getBusinessData } from "@/apis/commonApis";
import { redirect } from "next/navigation";

export default async function HotelLayout({
    params,
  children,
}: {
    params: { businessId: string };
  children: React.ReactNode;
}) {
    const businessData = await getBusinessData(params.businessId)

  if (businessData.outLetType !== "HOTEL") {
    redirect("/not-allowed");
  }

  return <>{children}</>;
}