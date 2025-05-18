import EBill from "@/components/organisms/eBill";

export const revalidate = 300;

export async function generateMetadata() {
  return {
    title: "Ebill",
    description: "Ebill page for businesses",
  };
}

export default async function Page() {
  return <EBill />;
}
