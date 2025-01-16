import EBill from "@/components/organisms/eBill";

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
}: { params: { businessId: string, tableId: string } }) {
    return <EBill />
}