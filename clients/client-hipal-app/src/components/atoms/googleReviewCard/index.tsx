import { memo } from "react";
import { useLogin, type IUserData } from "@/components/store/useLogin";
import type { IResponse } from "@/components/types/businessData";
import { apiRpc } from "@hi/common";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import useLoyaltyData from "@/components/store/useLoyaltyData";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "@/components/utils/helpers";
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
  const windowReference = window.open();
  const { errorText } = useErrorHandling();
  const customLink = useParams()?.businessId as string;
  const businessId = useBusinessDetails((s) => s.businessDetails?.businessId);
  const { setShowGoogleReview } = useReview((s) => ({
    setShowGoogleReview: s.setShowGoogleReview,
  }));
  const { loyaltySetting } = useLoyaltyData();
  const businessDetails = useBusinessDetails((s) => s.businessDetails);
  const { userDetails, setReviewPopup, setGoogleReviewCount } = useLogin(
    (s) => ({
      userDetails: s.userDetails,
      setReviewPopup: s.setReviewPopup,
      setGoogleReviewCount: s.setGoogleReviewCount,
    }),
  );
  const path = usePathname();
  const isReviewPage = path.includes("review");
  const isReviewGiven = async (userDetails: IUserData) => {
    let res: IResponse;
    const response = await apiRpc.subscribers.$get({
      query: {
        businessId: businessId.toString(),
        userId: userDetails._id.toString(),
        loyaltyId: loyaltySetting?.loyaltyId.toString(),
      },
    });
    res = await response.json();
    setGoogleReviewCount(res?.googleReviewCount);
    return res?.googleReviewCount;
  };

  const signInWithGoogle = async () => {
    try {
      const count: number = await isReviewGiven(userDetails);
      if (!!count && count > 1) return setReviewPopup(true);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      if (user === undefined) return null;
      const res = await apiRpc.reviews.storeGoogleAuthUser.$post({
        json: {
          businessId: businessId.toString(),
          loyaltyId: loyaltySetting.loyaltyId.toString(),
          userId: userDetails._id.toString(),
          authorName: user?.displayName || userDetails?.name,
        },
      });
      // if (res.status === 400) {
      //   toast.error("Review Already Submitted");
      //   router.push(`/${customLink}/explore`);
      //   setShowGoogleReview(false);
      //   return null;
      // }
      // if (res.status === 401) {
      //   return errorText(res.status);
      // }

      const url =
        businessDetails?.placeUrl || "https://g.page/r/CTI8IdplcFrJEAE/review";

      // // Try to open the URL in a new tab
      // const newWindow = window.open(url, "_blank");

      // // If the new window is blocked or not created, fall back to changing the current window's location
      // if (
      //   !newWindow ||
      //   newWindow.closed ||
      //   typeof newWindow.closed === "undefined"
      // ) {
      //   // Create a temporary anchor element
      //   const link = document.createElement("a");
      //   link.href = url;
      //   link.target = "_blank";
      //   link.rel = "noopener noreferrer";

      //   // Programmatically click the link
      //   document.body.appendChild(link);
      //   link.click();
      //   document.body.removeChild(link);
      // }

      router.push(url);
      setReviewPopup(true);
      setShowGoogleReview(false);
      return user;
    } catch (error) {
      console.error("Error during sign-in:", error);
    }
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
