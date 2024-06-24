import axios from "@/utils/axios";
import { redirect } from 'next/navigation';

const fetchBusinessData = async (customLink: string) => {
  try {
    const res = await axios.get(`/v1/businesses/n/${customLink}`);
    const businessId = res.data.data.businessId;
    return businessId;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export default async function Slug({ params }: { params: { customLink: string } }) {
  const businessId = await fetchBusinessData(params.customLink);
  if (!businessId) {
    redirect('/');
  }

  redirect(`/r/${businessId}/explore`);
  return null;
}
