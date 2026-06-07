import { useError } from "@/components/store/useError.ts";
import { apiRpc } from "@hi/common";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

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
    _id?: string;
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


export async function fetchReviews(payload: reviewPayload): Promise<ReviewApiResponse[]> {
  const res = await apiRpc.hotel.rooms.hotel_user_reviews.$post({
    json: payload,
  });
  const json = await res.json();
  if (!res.ok || json?.err) {
    throw new Error(json?.message || "Failed to fetch reviews");
  }
  return (json?.data ?? []) as ReviewApiResponse[];
}

export interface markReviewAsReadPayload {
  reviewId: string;
  readBy: string;
}

export const useMarkReviewAsRead = () => {
  const { setError, setOpenErrorModal } = useError();
  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (payload: markReviewAsReadPayload) => {
      const res = await apiRpc.hotel.rooms.review.read_by.$put({
        json: payload,
      });

      return res;
    },
    onSuccess: async (data) => {
      const extraData = await data.json();
      if (data.status === 400 || data.status === 401) {
        setError(extraData?.message);
        setOpenErrorModal(true);
        toast.error(extraData?.message);
        return;
      }
      if (data.status === 409) {
        toast.error("Review already marked as read");
        setError(extraData?.message);
        setOpenErrorModal(true);
        return;
      }
      if (data.status === 200 || data.status === 201) {
        toast.success("Review marked as read");
        return;
      }
    },
    onError: (error) => {
      throw new Error(error.message);
    },
  });

  return {
    isPending,
    markReviewAsRead: mutateAsync,
  };
};

export interface addReviewNotePayload {
  reviewId: string;
  note: string;
}

export const useAddReviewNote = () => {
  const { setError, setOpenErrorModal } = useError();
  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (payload: addReviewNotePayload) => {
      const res = await apiRpc.hotel.rooms.review.note.$put({
        json: payload,
      });

      return res;
    },
    onSuccess: async (data) => {
      const extraData = await data.json();
      if (data.status === 400 || data.status === 401) {
        setError(extraData?.message);
        setOpenErrorModal(true);
        toast.error(extraData?.message);
        return;
      }
      if (data.status === 409) {
        toast.error("Review already has note");
        setError(extraData?.message);
        setOpenErrorModal(true);
        return;
      }
      if (data.status === 200 || data.status === 201) {
        toast.success("Note added successfully");
        return;
      }
    },
    onError: (error) => {
      throw new Error(error.message);
    },
  });

  return {
    isPending,
    addReviewNote: mutateAsync,
  };
};
