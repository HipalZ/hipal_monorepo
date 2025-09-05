import { apiRpc } from "@hi/common";
import { useMutation } from "@tanstack/react-query";

export type ratingType = "AVG" | "GOOD" | "BAD";

export interface reviewFilter {
  rating?: ratingType;
  serviceIds?: string[];
  roomIds?: string[];
  staffIds?: string[];
  isRead?: boolean;
}

export interface reviewPayload {
  businessId: string;
  from?: number;
  to?: number;
  filter?: reviewFilter;
}

export interface reviewResponse {
  _id: string;
  userId?: { _id?: string; name?: string; phone?: string };
  reviewRating: number;
  improvementAreas?: string[];
  staffs?: string[];
  date?: number;
  isRead?: boolean;
  readAt?: number | null;
  readBy?: { _id?: string; name?: string } | null;
  roomId?: { _id?: string; name?: string };
  alertId?: {
    serviceIds?: { _id?: string; name?: string }[];
    acceptedBy?: { _id?: string; name?: string; phone?: string };
    deliveredBy?: { _id?: string; name?: string; phone?: string };
  };
  note?: string;
}

type ReviewApiResponse = {
  err: boolean;
  data: reviewResponse[];
  message?: string;
};

export const useGetAllReviews = () => {
  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (payload: reviewPayload) => {
      const res = await apiRpc.hotel.rooms.hotel_user_reviews.$post({
        json: payload,
      });

      // ❗ Parse the JSON body
      const json = (await res.json()) as ReviewApiResponse;

      // Optional: handle HTTP and API-level errors
      if (!res.ok || json.err) {
        throw new Error(json?.message || "Failed to fetch reviews");
      }

      return json.data ?? [];
    },
  });

  return {
    isPending,
    getAllReviews: mutateAsync,
  };
};
