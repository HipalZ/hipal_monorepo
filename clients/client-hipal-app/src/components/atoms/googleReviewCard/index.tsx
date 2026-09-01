import { memo, useMemo } from "react";
import { useLogin } from "@/components/store/useLogin";
import { apiRpc } from "@hi/common";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import useLoyaltyData from "@/components/store/useLoyaltyData";
import { useParams, usePathname, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import SkeletonLoader from "../loader/skeletonLoader";
import { useReview } from "@/components/store/useReview";
import toast from "react-hot-toast";
import LoadingSpinnerCircle from "../loader";
import { useErrorHandling } from "@/utils/helper";
import { usePaymentStore } from "@/components/store/usePaymentStore";

const ExplorePageReviewCard = dynamic(() => import("./explorePage"), {
  ssr: false,
  loading: () => <SkeletonLoader />,
});

const GoogleReviewPagePopup = dynamic(() => import("./reviewPage"), {
  ssr: false,
  loading: () => <LoadingSpinnerCircle />,
});

const MemoGoogleReviewCard = () => {
  const router = useRouter();
  const { errorText } = useErrorHandling();
  const customLink = useParams()?.businessId as string;
  const { setShowGoogleReview } = useReview((s) => ({
    setShowGoogleReview: s.setShowGoogleReview,
  }));
  const { setCheckLogin } = usePaymentStore();
  const { loyaltySetting } = useLoyaltyData();
  const businessDetails = useBusinessDetails((s) => s.businessDetails);

  const {
    userDetails,
    setReviewPopup,
    googleReviewCount,
    isLogin,
    setDirection,
  } = useLogin((s) => ({
    userDetails: s.userDetails,
    setReviewPopup: s.setReviewPopup,
    googleReviewCount: s.googleReviewCount,
    isLogin: s.isLogin,
    setDirection: s.setDirection,
  }));

  const path = usePathname();
  const isReviewPage = useMemo(() => path.includes("review"), [path]);

  const signInWithGoogle = async () => {
    const url = businessDetails?.placeUrl || "";
    // if no loyalty is there then redirect to Google review page
    if (!loyaltySetting?.loyaltyId) {
      const newWindow = window.open(url, "_blank");
      return;
    }
    if (!isLogin) {
      setDirection("explore-googleReview");
      setReviewPopup(false);
      setCheckLogin(true);
      return;
    }
    if (googleReviewCount && googleReviewCount > 1) {
      setReviewPopup(false);
      return toast.error("Review Already Submitted");
    }

    // Open the intended URL immediately to avoid being blocked
    const newWindow = window.open(url, "_blank");
    try {
      const res = await apiRpc.reviews["update-google-review"].$put({
        json: {
          loyaltyId: loyaltySetting?.loyaltyId.toString(),
          userId: userDetails._id.toString(),
        },
      });

      if (res.status === 409) {
        toast.error("Review Already Submitted");
        router.push(`/${customLink}/explore`);
        setShowGoogleReview(false);
        return;
      }

      if (res.status === 401 || res.status === 400) {
        errorText(res.status);
        setShowGoogleReview(false);
        newWindow?.close();
        return;
      }

      await res.json();
      if (res.status === 200) {
        setReviewPopup(true);
      }

      if (!newWindow) {
        toast.error(
          "Failed to open the new tab. Please enable pop-ups for this site and try again."
        );
        alert("Please enable pop-ups for this site to proceed.");
      }
    } catch (error) {
      console.error("Error during sign-in:", error);
      newWindow?.close();
    }
  };

  return (
    <>
      {isReviewPage ? (
        <GoogleReviewPagePopup
          signInWithGoogle={signInWithGoogle}
          id={loyaltySetting?.loyaltyId}
        />
      ) : (
        <ExplorePageReviewCard
          signInWithGoogle={signInWithGoogle}
          id={loyaltySetting?.loyaltyId}
        />
      )}
    </>
  );
};

const GoogleReviewCard = memo(MemoGoogleReviewCard);
export default GoogleReviewCard;
