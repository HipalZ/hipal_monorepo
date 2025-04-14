"use client"
import { memo, useCallback, useEffect, useState } from "react";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import useCouponTemp from "@/components/store/useCouponTemp";
import { useCouponz } from "@/components/store/useCouponz";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import { calculateDiscount, ICouponPage } from "@/components/utils/helpers";
import { toast } from "react-toastify";
import confetti from "canvas-confetti";
import { apiRpc } from "@hi/common";
import { useLogin } from "@/components/store/useLogin";
import { DialogTitle } from "@headlessui/react";
import { GoAlert } from "react-icons/go";
import { IoCheckmark } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import dynamic from "next/dynamic";
import SkeletonLoader from "@/components/atoms/loader/skeletonLoader";
import { useErrorHandling } from "@/utils/helper";
import { useUpdateBill } from "@/components/hooks/usePayments";
import { useMutation, useQuery } from "@tanstack/react-query";
import { _useAllBusiness } from "@/components/store/useAllBusiness";

const ApplyCouponzComponent = dynamic(() => import("./applyCouponzComponent"), {
  loading: () => <SkeletonLoader height={200} />,
});

const AlertToRemove = dynamic(
  () => import("@/components/atoms/alertToRemove"),
  {
    loading: () => <SkeletonLoader height={200} />,
  },
);

const ApplyCouponDatePopup = dynamic(
  () => import("@/components/templates/newPayment/datePopup"),
  {
    loading: () => <SkeletonLoader height={200} />,
  },
);

const MemoApplyCouponz = () => {
  const { errorText } = useErrorHandling();
  const outletInfo = _useAllBusiness((state) => state.data.outletInfo);

  const { showAlert, setShowAlert } = useCouponTemp((s) => ({
    showAlert: s.showAlert,
    setShowAlert: s.setShowAlert,
  }));
  const { businessId } = useBusinessDetails((s) => ({
    businessId: s.businessDetails?.businessId,
  }));

  const { userDetails } = useLogin((s) => ({
    userDetails: s.userDetails,
  }));

  const { showPopup, setShowPopup } = useCouponTemp((s) => ({
    showPopup: s.showPopup,
    setShowPopup: s.setShowPopup,
  }));

  const {
    billValue,
    setClaimCouponz,
    claimedCoins,
    setClaimedCoins,
    billData
  } = usePaymentStore((s) => ({
    billValue: s.billValue,
    claimedCoins: s.claimedCoins,
    setClaimedCoins: s.setClaimedCoins,
    setClaimCouponz: s.setClaimCouponz,
    billData: s.billData,
  }));

  const {
    setCurrentPage,
    availedCoupon,
    setAvailedCoupon,
    setDirection,
    setCouponOccasion,
    setUserCouponz,
    setSelectedCoupon,
    greatDeals,
    missingOut,
    setGreatDeals,
    setMissingOut,
    upcomingCouponz,
    setUpcomingCouponz,
  } = useCouponz((s) => ({
    setCurrentPage: s.setCurrentPage,
    availedCoupon: s.availedCoupon,
    setAvailedCoupon: s.setAvailedCoupon,
    setDirection: s.setDirection,
    setCouponOccasion: s.setCouponOccasion,
    setUserCouponz: s.setUserCouponz,
    setSelectedCoupon: s.setSelectedCoupon,
    greatDeals: s.greatDeals,
    missingOut: s.missingOut,
    setGreatDeals: s.setGreatDeals,
    setMissingOut: s.setMissingOut,
    upcomingCouponz: s.upcomingCouponz,
    setUpcomingCouponz: s.setUpcomingCouponz,
  }));

  const { updateBill } = useUpdateBill()
  const { mutateAsync } = useMutation({
    mutationFn: updateBill,
  })

  const [selectedCoupon, setSelectedCouponState] = useState(null);
  const { setApplyCouponz, setIsLoading } = useCouponTemp(
    (s) => ({
      setApplyCouponz: s.setApplyCouponz,
      setIsLoading: s.setIsLoading,
    }),
  );

  const closeCouponz = useCallback(() => {
    setApplyCouponz(false);
  }, [setApplyCouponz]);

  const applyCoupon = useCallback(
    async (coupon) => {
      // Check if bill value is less than coupon value
      if (coupon?.conditions?.availability?.customDays?.length > 0) {
        const day = new Date().toLocaleString("en-US", { weekday: "long" });
        if (
          !coupon?.conditions?.availability?.customDays.includes(
            day?.toLowerCase(),
          )
        ) {
          return toast.info("Coupon is not available today");
        }
      }
      if (coupon?.conditions?.billValue > billValue)
        return toast.info("Bill value is less than coupon value");

      if (claimedCoins > 0) {
        setSelectedCouponState(coupon);
        setShowAlert(true);
        return;
      }

      await applyCouponLogic(coupon);
    },
    [billValue, claimedCoins, setShowAlert, setSelectedCouponState],
  );

  const replaceLoyalty = useCallback(async () => {
    setClaimedCoins(0);
    setShowAlert(false);
    toast.success("Coinz removed successfully");
    if (selectedCoupon) {
      await applyCouponLogic(selectedCoupon);
    }
  }, [setClaimedCoins, setShowAlert, selectedCoupon]);

  const applyCouponLogic = useCallback(
    async (coupon) => {
      // Check if bill value is less than coupon value
      if (coupon?.conditions?.billValue > billValue)
        return toast.info("Bill value is less than coupon value");
      let response: any;
      const requiredFields = coupon?.conditions?.requiredFields || [];
      const requiresDobOrSpecialDay =
        requiredFields.includes("dob") || requiredFields.includes("specialday");
      setIsLoading(true);
      if (requiresDobOrSpecialDay) {
        response = await apiRpc.couponz["check-grabbed-couponz"].$post({
          json: {
            couponId: coupon?._id,
            userId: userDetails?._id,
            businessId: businessId,
          },
        });
      }
      // Check if user already has a coupon if not send him to birthday popup
      if (response?.status === 400) {
        setCurrentPage(ICouponPage.BIRTHDAYCOUPON);
        setDirection("payment");
        setCouponOccasion(
          requiredFields.includes("dob") ? "dob" : "specialday",
        );
        setShowPopup(true);
        setAvailedCoupon(coupon);
        setSelectedCoupon(coupon);
        setIsLoading(false);
        return;
      }
      if (response?.status === 401) {
        return errorText(response.status);
      }
      setIsLoading(false);
      // any condition apply the coupon
      const { discountValue, resetClaimedCoins } = calculateDiscount(
        coupon,
        billValue,
        claimedCoins,
      );
      if (outletInfo?.isPosEnabled) {
        mutateAsync({
          coinz: discountValue,
          couponId: coupon?._id,
        })
      }
      setClaimCouponz(discountValue);
      if (resetClaimedCoins) {
        setClaimedCoins(0);
      }

      setApplyCouponz(false);
      setAvailedCoupon(coupon);
      setSelectedCoupon(coupon);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      let audio: HTMLAudioElement;
      audio = new Audio("/sounds/Money.mp3");
      audio.play();
      return () => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      };
    },
    [
      billValue,
      claimedCoins,
      setDirection,
      setClaimCouponz,
      setClaimedCoins,
      setApplyCouponz,
      setAvailedCoupon,
    ],
  );

  const removeCoupon = useCallback(() => {
    setAvailedCoupon({});
    setClaimCouponz(0);
    mutateAsync({
      coinz: 0,
    })
    setApplyCouponz(false);
  }, [mutateAsync, setClaimCouponz, setAvailedCoupon, setApplyCouponz]);

  // if availedCoupon from the apply couponz then calculate the discount
  useEffect(() => {
    if (availedCoupon?._id) {
      const { discountValue, resetClaimedCoins } = calculateDiscount(
        availedCoupon,
        billValue,
        claimedCoins,
      );

      setClaimCouponz(discountValue);
      if (resetClaimedCoins) {
        setClaimedCoins(0);
      }
    }
  }, [availedCoupon]);

  const getUserCouponz = async () => {
    try {
      const response = await apiRpc.couponz["eligible-coupons"][":businessId"][
        ":userId"
      ].$get({
        param: {
          businessId: businessId,
          userId: userDetails?._id,
        },
      });
      const res = await response.json();

      // Initialize categories
      const currentTime = new Date().getTime();
      const greatDeals = [];
      const missingOut = [];
      const upcomingCouponz = [];

      res?.data.forEach((coupon) => {
        const { conditions } = coupon;
        const startTime = conditions?.couponStartDate
          ? new Date(conditions.couponStartDate).getTime()
          : null;
        const endTime = conditions?.couponEndDate
          ? new Date(conditions.couponEndDate).getTime()
          : null;

        // Check if the coupon is within the valid date range
        const isUpcoming = startTime && currentTime < startTime; // Coupon not started yet
        const isExpired = endTime && currentTime > endTime; // Coupon expired

        if (isUpcoming) {
          upcomingCouponz.push(coupon);
          return;
        }

        if (isExpired) {
          // Ignore expired coupons (optional: handle separately if needed)
          return;
        }

        // Check bill value to classify as `greatDeals` or `missingOut`
        if (billValue >= conditions.billValue) {
          greatDeals.push(coupon);
        }
        missingOut.push(coupon);
      });

      // Update state
      setGreatDeals(greatDeals);
      setMissingOut(missingOut);
      setUpcomingCouponz(upcomingCouponz); // New state for upcoming coupons
      setUserCouponz(res.data || []);

      return res.data;
    } catch (err) {
      console.error("Error fetching user coupons:", err);
    }
  };

  useQuery({
    queryKey: ["getUserCouponz", businessId, userDetails._id],
    queryFn: getUserCouponz,
    enabled: !!businessId && !!userDetails._id,
  });

  return (
    <>
      {showPopup ? <ApplyCouponDatePopup /> :
        <ApplyCouponzComponent
          closeCouponz={closeCouponz}
          greatDeals={greatDeals}
          missingOut={missingOut}
          upcomingCouponz={upcomingCouponz}
          removeCoupon={removeCoupon}
          applyCoupon={applyCoupon}
          billData={billData}
          billValue={billValue}
          availedCoupon={availedCoupon}
        />}
      {showAlert ? (
        <AlertToRemove onClose={() => setShowAlert(false)} show>
          <DialogTitle
            as="h3"
            className="flex items-center justify-center mb-4 text-lg font-medium leading-6 text-gray-900"
          >
            <GoAlert className="w-12 h-12 mr-2 text-yellow-500" />
            Applying Couponz removes the Coinz!
          </DialogTitle>
          <div className="mt-2">
            <p className="text-sm text-center text-gray-500">
              Are you sure you want to remove the Coinz?
            </p>
          </div>

          <div className="flex justify-center mt-6 space-x-4">
            <button
              type="button"
              className="inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-[#9267EC] border border-transparent rounded-md hover:bg-[#9267EC] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              onClick={replaceLoyalty}
            >
              <IoCheckmark className="w-4 h-4 mr-2" />
              Yes
            </button>
            <button
              type="button"
              className="inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-[#EC678D] border border-transparent rounded-md hover:bg-[#EC678D] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
              onClick={() => setShowAlert(false)}
            >
              <RxCross2 className="w-4 h-4 mr-2" />
              Cancel
            </button>
          </div>
        </AlertToRemove>
      ) : null}
    </>
  );
};

const ApplyCouponz = memo(MemoApplyCouponz);
export default ApplyCouponz;
