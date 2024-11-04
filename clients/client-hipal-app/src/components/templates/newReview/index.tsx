"use client";
import { memo, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { apiRpc } from "@hi/common";
import { useQuery } from "@tanstack/react-query";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import { useLogin } from "@/components/store/useLogin";
import { toast } from "react-toastify";
import { useReview } from "@/components/store/useReview";
import dynamic from "next/dynamic";
import { calculateRating, cn } from "@/components/utils/helpers";
import LoadingSpinner from "@/components/atoms/progressBar/loadingSpinner";
import { useErrorHandling } from "@/utils/helper";

const Staffs = dynamic(() => import("./staffs"), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});
const Improvements = dynamic(() => import("./improvements"), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});
const Lotties = dynamic(() => import("./lotties"), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});
const Ripples = dynamic(() => import("./ripples"), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});
const GReview = dynamic(() => import("./gReview"), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});
const ReviewTopSection = dynamic(() => import("./reviewTopSection"), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});

const Comments = dynamic(() => import("./comments"), {
  ssr: false,
  loading: () => <LoadingSpinner />,
});

interface Payload {
  businessId: string;
  userId: string;
  reviewRating: number;
  description: string;
  date: number;
  order_id: string | undefined;
  staffs: string[];
  foodTaste?: 0 | 1 | null;
  ambience?: 0 | 1 | null;
  hygiene?: 0 | 1 | null;
  service?: 0 | 1 | null;
}

const MemoReviewPage = () => {
  const customLink = useParams()?.businessId as string;
  const { errorText } = useErrorHandling();
  const router = useRouter();
  const businessId = useBusinessDetails((s) => s.businessDetails?.businessId);
  const searchParams = useSearchParams();
  const orderId = searchParams?.get("orderId");
  const { userDetails, googleReviewCount } = useLogin((s) => ({
    userDetails: s.userDetails,
    googleReviewCount: s.googleReviewCount,
  }));
  const {
    description,
    showSuggestions,
    selectedEmoji,
    staffs,
    setStaffs,
    storeStaffId,
    improve,
    bgColor,
    curveColor,
    setShowGoogleReview,
  } = useReview((s) => ({
    description: s.description,
    showSuggestions: s.showSuggestions,
    selectedEmoji: s.selectedEmoji,
    staffs: s.staffs,
    setStaffs: s.setStaffs,
    storeStaffId: s.storeStaffId,
    improve: s.improve,
    bgColor: s.bgColor,
    curveColor: s.curveColor,
    setShowGoogleReview: s.setShowGoogleReview,
  }));

  const result = async () => {
    const rating = await calculateRating(selectedEmoji);
    const payload: Payload = {
      businessId: businessId,
      userId: userDetails?._id,
      reviewRating: Number(rating),
      description: description,
      date: Date.now(),
      order_id: orderId?.toString(),
      staffs: storeStaffId,
    };

    if (improve?.["Food Taste"] === 1 || improve?.["Food Taste"] === 0) {
      payload.foodTaste = improve?.["Food Taste"];
    }
    if (improve?.Ambience === 1 || improve?.Ambience === 0) {
      payload.ambience = improve?.Ambience;
    }
    if (
      improve?.["Hygiene & Cleanliness"] === 1 ||
      improve?.["Hygiene & Cleanliness"] === 0
    ) {
      payload.hygiene = improve?.["Hygiene & Cleanliness"];
    }
    if (
      improve?.["Waiter & Behavior"] === 1 ||
      improve?.["Waiter & Behavior"] === 0
    ) {
      payload.service = improve?.["Waiter & Behavior"];
    }
    const res = await apiRpc.payments.reviews.$post({
      json: payload,
    });
    if (res.status === 401) {
      return errorText(res.status);
    }
    const response = await res.json();
    if (res.status === 200) {
      toast.success(response.message || "Review submitted successfully");
      return router.push(`/${customLink}/explore`);
    }
    if (res.status === 400) {
      toast.error(response.message || "Review not submitted");
    }
    // if (googleReviewCount === 0) {
    //   setShowGoogleReview(true);
    // } else {
    //   setShowGoogleReview(false);
    //   router.push(`/${customLink}/explore`);
    // }
  };

  const getStaff = useCallback(async () => {
    const res = await apiRpc.users[":businessId"].$get({
      param: {
        businessId: businessId,
      },
    });
    const response = await res.json();
    setStaffs(response?.data || []);
    return response?.data;
  }, [setStaffs, businessId]);

  const skipUserReview = useCallback(() => {
    if (googleReviewCount === 0) {
      setShowGoogleReview(true);
    } else {
      setShowGoogleReview(false);
      router.push(`/${customLink}/explore`);
    }
  }, [googleReviewCount, setShowGoogleReview, router, customLink]);

  useQuery({
    queryKey: ["getStaff", businessId],
    queryFn: getStaff,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: showSuggestions && staffs.length === 0 && !!businessId,
  });

  return (
    <>
      <section
        className="h-full min-h-[100dvh] relative overflow-x-hidden overflow-y-auto pb-[5rem]"
        style={{
          backgroundColor: selectedEmoji !== null ? curveColor : bgColor,
        }}
      >
        <ReviewTopSection />
        <Lotties />
        <Improvements />
        <Staffs />
        <Comments />
        <center
          onKeyDown={skipUserReview}
          onClick={skipUserReview}
          className="absolute pb-1 mb-8 text-xs text-gray-500 underline -translate-x-1/2 left-1/2 bottom-10"
        >
          Skip
        </center>
        <button
          onClick={result}
          type="button"
          disabled={!orderId}
          className={cn(
            selectedEmoji !== null && orderId
              ? "bg-black"
              : "opacity-50 pointer-events-none bg-gray-500",
            "bottom_btn text-sm h-10",
          )}
        >
          Continue
        </button>
        <Ripples />
        {/* <GReview /> */}
      </section>
    </>
  );
};

const ReviewPage = memo(MemoReviewPage);
export default ReviewPage;
