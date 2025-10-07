import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";

export const businessCardTypes = {
  RESTAURANT: "restaurant",
  HOTEL: "hotel",
  JEWELLERY: "jewellery",
  SALON: "salon",
  SPA: "spa",
  GYM: "gym",
  CLINIC: "clinic",
  DENTAL: "dental",
  CLOTHING: "clothing",
} as const;

type BusinessCardType = keyof typeof businessCardTypes;

interface ICardPayload {
  businessId: string;
  userId: string;
  type: BusinessCardType;
}

export const useGetBusinessCards = (payload: ICardPayload) => {
  const getAllCards = async () => {
    const { type, businessId, userId } = payload;
    const apiType = businessCardTypes[type];
    const response = apiRpc[apiType]?.cards.$get({
      query: { businessId, userId },
    });

    if (!response) {
      throw new Error(`API not found for type: ${type}`);
    }

    const res = (await response).json();
    const cards = (await res).data;

    return cards;
  };

  const { isLoading, data, refetch } = useQuery({
    queryKey: ["getAllCards", payload.type, payload.businessId, payload.userId],
    queryFn: getAllCards,
    enabled: !!payload.businessId && !!payload.userId && !!payload.type,
    staleTime: 300_000,
  });

  return { isLoading, data, refetch };
};
