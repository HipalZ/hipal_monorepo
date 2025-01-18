import BottomPopUp from "@/components/atoms/bottomPopUp";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import { useCartStore } from "@/components/store/useCartStore";
import { type IUserData, useLogin } from "@/components/store/useLogin";
import type {
  BusinessDetails,
  IBusinessData,
  IResponse,
} from "@/components/types/businessData";
import { apiRpc, cn } from "@hi/common";
import { useUserToken } from "@hi/common/src/useUserToken";
import { useParams, useRouter } from "next/navigation";
import { memo, useCallback, useEffect } from "react";
import SubScribeModal from "../../subscribe";
import ReviewModal from "../googleReviews/reviewModal";
import LoadingSpinnerCircle from "@/components/atoms/loader";
import { _useAllBusiness } from "@/components/store/useAllBusiness";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/components/store/useCart";

const MemoIntroduction = ({ data }: { data: IBusinessData }) => {
  const accessToken = useUserToken.getState().accessToken;
  const { businessDetails } = useBusinessDetails();
  const router = useRouter();
  const setAccessToken = useUserToken.getState().setAccessToken;
  const {
    subscribeModal,
    setSubscribeModal,
    userDetails,
    setUserCoinZ,
    reviewPopup,
    setReviewPopup,
    setGoogleReviewCount,
  } = useLogin();
  const { cart, emptyCart } = useCart()
  const { setCartEmpty } = useCartStore();
  const customLink = useParams()?.businessId as string;
  const outletInfo = _useAllBusiness((s) => s.data.outletInfo);
  const business = data.business as BusinessDetails;

  const isSubscribe = async (userDetails: IUserData) => {
    const { business } = data;

    const loyaltyId = data?.loyalty?.loyaltyId;
    const payload = {
      businessId: business?.businessId?.toString() ?? "",
      userId: userDetails._id,
      ...(loyaltyId && { loyaltyId }),
    };

    const response = await apiRpc.subscribers.$get({
      query: payload,
    });
    const res: IResponse = await response.json();
    if (response.status === 404) {
      setSubscribeModal(true);
    }
    if (response.status === 200) {
      setUserCoinZ(res?.rewards);
      setGoogleReviewCount(res?.googleReviewCount);
    }
    return response;
  };

  const toggleReviewPopup = useCallback(() => {
    setReviewPopup(!reviewPopup);
  }, [reviewPopup]);

  const closeSubscribeModal = useCallback(() => {
    setSubscribeModal(false);
    setAccessToken("");
    return router.push(`/${customLink}/explore`);
  }, [accessToken, subscribeModal]);

  const redirectUrl = useCallback(() => {
    const url = businessDetails?.placeUrl || "";
    window.open(url, "_blank");
  }, [businessDetails?.placeUrl]);

  useEffect(() => {
    if (!accessToken) {
      setAccessToken("");
    }
    if (cart?.[0]?.dish?.businessId !== data?.business?.businessId) {
      emptyCart();
      setCartEmpty();
    }
  }, [businessDetails?.businessId, data?.business?.businessId]);

  const { isPending: isLoader, } = useQuery({
    queryKey: ["isSubscribe", customLink, userDetails],
    queryFn: () => isSubscribe(userDetails),
    enabled: !!userDetails._id && !!customLink,
  })

  return (
    <>
      {isLoader ? <LoadingSpinnerCircle /> : <>
        <section className="absolute z-20 bottom-6 left-6 w-[75%] text-white">
          <span onClick={redirectUrl} className="text-xs px-3 py-2 rounded-full bg-[#ffffff30]">
            ⭐ {outletInfo?.avgRating || 4.7}
          </span>
          <h3 className="mt-2 text-3xl capitalize space-grotesk-700">
            {data?.business?.name}
          </h3>
          <p className={cn("text-sm line-clamp-2 capitalize mb-4")}>
            {Array.isArray(data?.business?.tags)
              ? data?.business?.tags.join(" | ")
              : data?.business?.tags}
          </p>
          <h4 className="mb-1 text-xs font-semibold line-clamp-2">
            {data?.business?.address}
          </h4>
        </section>
        {subscribeModal && (
          <BottomPopUp show={subscribeModal} onClose={closeSubscribeModal} hide>
            <SubScribeModal
              closeSubscribeModal={closeSubscribeModal}
              business={business}
            />
          </BottomPopUp>
        )}
        {reviewPopup && (
          <BottomPopUp show={reviewPopup} onClose={toggleReviewPopup}>
            <ReviewModal closeModal={toggleReviewPopup} />
          </BottomPopUp>
        )}
      </>}
    </>
  );
};

const Introduction = memo(MemoIntroduction);
export default Introduction;
