import useBusinessData from "@/components/store/useBusinessData";
import { useReview } from "@/components/store/useReview";
import useTimings from "@/components/store/useTimings";
import { apiRpc } from "@hi/common";
import type { ReviewsType } from "@hi/db-models/src/validators";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import toast from "react-hot-toast";

export const useGetAllUsersReview = (pageNumber: number) => {
  const businessData = useBusinessData((state) => state.businessData);
  const businessId = businessData?._id;

  const { timeStampStart, timeStampEnd } = useTimings();

  const getAllReviews = useCallback(async () => {
    if (!businessId || !timeStampStart || !timeStampEnd) return [];

    const reviews = await apiRpc.reviews.$get({
      query: {
        businessId: businessId,
        from: timeStampStart.toString(),
        to: timeStampEnd.toString(),
        pageNumber: pageNumber.toString(),
      },
    });

    const reviewData = await reviews.json();
    return reviewData.data?.reviews as ReviewsType[];
  }, [businessId, timeStampStart, timeStampEnd, pageNumber]);

  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ["reviews", businessId, timeStampStart, timeStampEnd, pageNumber],
    queryFn: getAllReviews,
    enabled: !!businessId && !!timeStampStart && !!timeStampEnd && !!pageNumber,
  });

  return {
    reviewsData,
    reviewsLoading,
  };
};

export const useCreateReviewTemplate = () => {
  const { setPage } = useReview();
  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (payload: ReviewsType) => {
      const response = await apiRpc.reviews.sendMessage.$post({
        json: payload,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (!data.err) {
        toast.success("Review sent successfully");
        setPage("Review");
      }
    },
    onError: (error) => {
      toast.error("Failed to send review");
      console.log("error sending message", error);
    },
  });

  return {
    isPending,
    createReview: mutateAsync,
  };
};

export const useGetAllStaffReview = () => {
  const businessData = useBusinessData((state) => state.businessData);
  const businessId = businessData?._id;

  const getAllStaffReviews = useCallback(async () => {
    if (!businessId) return [];

    const reviews = await apiRpc.reviews.staffReviews.$get({
      query: {
        businessId: businessId,
      },
    });

    const reviewData = await reviews.json();
    return reviewData.data?.res;
  }, [businessId]);

  const { data: staffReviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ["getAllStaffReviews", businessId],
    queryFn: getAllStaffReviews,
    enabled: !!businessId,
  });

  return {
    staffReviewsData,
    reviewsLoading,
  };
};
