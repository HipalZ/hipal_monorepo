import { memo, useMemo } from "react";
import { useLogin } from "@/components/store/useLogin";
import { apiRpc } from "@hi/common";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import useLoyaltyData from "@/components/store/useLoyaltyData";
import { useParams, usePathname, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import SkeletonLoader from "../loader/skeletonLoader";
import { useReview } from "@/components/store/useReview";
import { toast } from "react-toastify";
import LoadingSpinnerCircle from "../loader";
import { useErrorHandling } from "@/utils/helper";

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
  const { loyaltySetting } = useLoyaltyData();
  const businessDetails = useBusinessDetails((s) => s.businessDetails);

  const {
    userDetails,
    setReviewPopup,
    googleReviewCount,
    setGoogleReviewCount,
  } = useLogin((s) => ({
    userDetails: s.userDetails,
    setReviewPopup: s.setReviewPopup,
    googleReviewCount: s.googleReviewCount,
    setGoogleReviewCount: s.setGoogleReviewCount,
  }));

  const path = usePathname();
  const isReviewPage = useMemo(() => path.includes("review"), [path]);

  const signInWithGoogle = async () => {
    if (!!googleReviewCount && googleReviewCount > 1) {
      return setReviewPopup(true);
    }

    // Open a blank tab immediately to avoid being blocked
    let newWindow = window.open(businessDetails?.placeUrl, "_blank");

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
      newWindow?.close();
      return null;
    }

    const url =
      businessDetails?.placeUrl || "https://g.page/r/CTI8IdplcFrJEAE/review";
    if (newWindow) {
      newWindow.location.href = url;
      newWindow.focus();
    } else {
      toast.error(
        "Failed to open the new tab. Please enable pop-ups for this site and try again.",
      );
    }
    setReviewPopup(true);
    setShowGoogleReview(false);
  };

  return (
    <>
      {isReviewPage ? (
        <GoogleReviewPagePopup signInWithGoogle={signInWithGoogle} />
      ) : (
        <ExplorePageReviewCard signInWithGoogle={signInWithGoogle} />
      )}
    </>
  );
};

const GoogleReviewCard = memo(MemoGoogleReviewCard);
export default GoogleReviewCard;
