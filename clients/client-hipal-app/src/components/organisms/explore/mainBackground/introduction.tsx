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
import React, { memo, useCallback, useEffect, useState } from "react";
import { GrLocation } from "react-icons/gr";
import { MdOutlineCall } from "react-icons/md";
import SubScribeModal from "../../subscribe";
import ReviewModal from "../googleReviews/reviewModal";
import LoadingSpinnerCircle from "@/components/atoms/loader";
import { _useAllBusiness } from "@/components/store/useAllBusiness";

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
  const { setCartEmpty } = useCartStore();
  const customLink = useParams()?.businessId as string;
  const outletInfo = _useAllBusiness((s) => s.data.outletInfo);
  const business = data.business as BusinessDetails;
  const [isLoader, setIsLoader] = useState<boolean>(false);
  const { location, phone } = data.outletInfo;
  const goToLocation = useCallback(() => {
    if (typeof window === "undefined") return;
    window.open(location, "_blank");
  }, [location]);

  const callTheOwner = useCallback(() => {
    if (typeof window === "undefined") return;
    window.open(`tel:${phone}`);
  }, [phone]);

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
  };

  const toggleReviewPopup = useCallback(() => {
    setReviewPopup(!reviewPopup);
  }, [reviewPopup]);

  const closeSubscribeModal = useCallback(() => {
    setSubscribeModal(false);
    setAccessToken("");
    return router.push(`/${customLink}/explore`);
  }, [accessToken, subscribeModal]);

  useEffect(() => {
    if (!accessToken) {
      setAccessToken("");
    }
    if (businessDetails?.businessId !== data?.business?.businessId) {
      setCartEmpty();
    }
  }, [businessDetails?.businessId, data?.business?.businessId]);

  useEffect(() => {
    if (userDetails?._id) {
      isSubscribe(userDetails);
    }
  }, [customLink, userDetails._id]);

  if (isLoader) {
    return <LoadingSpinnerCircle />;
  }

  return (
    <>
      {" "}
      <section className="absolute z-20 bottom-6 left-6 w-[75%] text-white">
        <span className="text-xs px-3 py-2 rounded-full bg-[#ffffff30]">
            ⭐ {outletInfo?.avgRating}
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
      <section className="absolute z-20 flex flex-col space-y-5 bottom-4 right-4 ">
        <button
          onClick={goToLocation}
          className="p-3 rounded-full bg-primary text-base-100"
          type="button"
        >
          <GrLocation size="20" />
        </button>
        <button
          onClick={callTheOwner}
          className="p-3 text-black bg-white rounded-full"
          type="button"
        >
          <MdOutlineCall size="20" />
        </button>
      </section>
      {subscribeModal && (
        <BottomPopUp show={subscribeModal} onClose={closeSubscribeModal} hide>
          <SubScribeModal
            closeSubscribeModal={closeSubscribeModal}
            setIsLoader={setIsLoader}
            business={business}
            setSubscribeModal={setSubscribeModal}
          />
        </BottomPopUp>
      )}
      {reviewPopup && (
        <BottomPopUp show={reviewPopup} onClose={toggleReviewPopup}>
          <ReviewModal closeModal={toggleReviewPopup} />
        </BottomPopUp>
      )}
    </>
  );
};

const Introduction = memo(MemoIntroduction);
export default Introduction;
