import { businessApis } from "@/apis/explore";
import PosPayment from "@/components/templates/posPayment";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export async function generateMetadata() {
    return {
        title: "Payment",
        description: "Payment page for businesses",
    };
}

export default async function Page({
    params,
}: { params: { businessId: string } }) {
    const data = await businessApis.all(params.businessId);
    return <PosPayment data={data} />
}
