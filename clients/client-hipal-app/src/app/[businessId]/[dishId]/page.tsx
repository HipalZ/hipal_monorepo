import type { Metadata } from "next";
import IndividualItemPage from "@/components/individualItem";
import { apiRpc } from "@hi/common";
import { notFound } from "next/navigation";
import { BUSINESS_KEYID } from "@/configs";

export async function generateMetadata({ params }): Promise<Metadata> {
  const { dishId, businessId } = params;

  // Fetch dish data
  const response = await apiRpc.dishes[":id"].$get({ param: { id: dishId } });
  const dishData = await response.json();

  if (!dishData || !dishData.data) {
    return notFound();
  }

  const { name, description, images } = dishData.data;

  return {
    title: name,
    description: description || "Discover our delicious dishes.",
    openGraph: {
      title: name,
      description: description || "Discover our delicious dishes.",
      images: [
        {
          url: images?.[0],
          width: 1200,
          height: 630,
          alt: name,
        },
      ],
      url: `${BUSINESS_KEYID}${businessId}/${dishId}`,
      type: "website",
    },
  };
}

const Page = async ({ params }: { params: { dishId: string } }) => {
  const { dishId } = params;

  const response = await apiRpc.dishes[":id"].$get({ param: { id: dishId } });
  const dishData = await response.json();

  if (!dishData || !dishData.data) {
    return notFound();
  }

  return <IndividualItemPage dishData={dishData.data} />;
};

export default Page;
