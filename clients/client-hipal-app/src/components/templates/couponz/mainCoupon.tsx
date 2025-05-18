"use client";
import { ICouponPage } from "@/components/utils/helpers";
import { useCouponz } from "@/components/store/useCouponz";
import dynamic from "next/dynamic";
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import type { Coupon, IBiz } from "@/components/types/businessData";
import { useQuery } from "@tanstack/react-query";
import { apiRpc } from "@hi/common";
import useCouponTemp from "@/components/store/useCouponTemp";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import LoadingSpinnerCircle from "@/components/atoms/loader";
import useTableData from "@/components/store/useTableData";
import { toast } from "react-toastify";

const Couponz = dynamic(() => import("./singleCoupon"), {
  loading: () => <SkeletonLoader height={200} />,
});
const OccasionPopup = dynamic(() => import("./occasionPopup"), {
  loading: () => <LoadingSpinnerCircle />,
});
const Congratulationz = dynamic(() => import("./congratulationz"), {
  loading: () => <SkeletonLoader height={200} />,
});

const SeeMyCouponz = dynamic(() => import("./seeMyCouponz"), {
  loading: () => <SkeletonLoader height={200} />,
});

const TermsAndConditions = dynamic(
  () => import("@/components/atoms/termsAndConditions"),
  {
    loading: () => <LoadingSpinnerCircle />,
  },
);

const BottomPopUp = dynamic(() => import("@/components/atoms/bottomPopUp"), {
  loading: () => <LoadingSpinnerCircle />,
});

const MainCoupon = ({ business }: { business: IBiz }) => {
  const customLink = useParams()?.businessId as string;
  const { couponId, channelId } = useParams();
  const router = useRouter();
  console.log("router", router);
  const searchParams = useSearchParams();
  console.log("searchParams", searchParams);
  const { setBusinessDetails } = useBusinessDetails((s) => ({
    businessDetails: s.businessDetails,
    setBusinessDetails: s.setBusinessDetails,
  }));
  const { setTableName, setTableNameTimeStamp } = useTableData();
  const { openTc, displayTermsAndConditions, isLoading, setIsLoading } =
    useCouponTemp((s) => ({
      openTc: s.openTc,
      displayTermsAndConditions: s.displayTermsAndConditions,
      isLoading: s.isLoading,
      setIsLoading: s.setIsLoading,
    }));
  const { currentPage, setSelectedCoupon, setChannelId, setCurrentPage } =
    useCouponz((s) => ({
      currentPage: s.currentPage,
      setSelectedCoupon: s.setSelectedCoupon,
      setChannelId: s.setChannelId,
      setCurrentPage: s.setCurrentPage,
    }));

  const fetchSingleCouponz = async () => {
    setIsLoading(true);
    setCurrentPage(ICouponPage.SINGLECOUPON);
    try {
      const couponResponse = await apiRpc.couponz[":couponId"].$get({
        param: {
          couponId: couponId as string,
        },
      });
      const coupon = await couponResponse.json();
      if (couponResponse?.status === 404) {
        toast.error("Coupon Expired");
        setIsLoading(false);
        router.push(`/${customLink}/explore`);
      }
      setSelectedCoupon(coupon?.data as Coupon);
      setBusinessDetails(business);
      setTableName("");
      setChannelId(channelId as string);
    } catch (err) {
      setIsLoading(false);
      if (couponId === undefined) {
        router.push(`/${customLink}/explore`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useQuery({
    queryKey: ["singleCouponz", customLink, couponId, channelId],
    queryFn: fetchSingleCouponz,
    enabled: !!customLink && !!couponId && !!channelId,
  });

  return (
    <>
      {currentPage === ICouponPage.SINGLECOUPON && <Couponz />}
      {currentPage === ICouponPage.BIRTHDAYCOUPON && <OccasionPopup />}
      {currentPage === ICouponPage.CONGRATULATIONZ && <Congratulationz />}
      {currentPage === ICouponPage.SEEMYCOUPONZ && <SeeMyCouponz />}
      {openTc && (
        <BottomPopUp
          show={openTc}
          onClose={() => displayTermsAndConditions(openTc)}
        >
          <TermsAndConditions />
        </BottomPopUp>
      )}
      {isLoading && <LoadingSpinnerCircle />}
    </>
  );
};

export default MainCoupon;
