"use client";
import React, { memo, useCallback, useEffect, useState } from "react";
import { BiArrowBack } from "react-icons/bi";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import useCouponTemp from "@/components/store/useCouponTemp";
import { useCouponz } from "@/components/store/useCouponz";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import {
  calculateDiscount,
  cn,
  formatDate,
  formatDiscount,
  ICouponPage,
} from "@/components/utils/helpers";
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
import ShimmerImage from "@/components/atoms/imageshimmer";
import { useErrorHandling } from "@/utils/helper";
import { useUpdateBill } from "@/components/hooks/usePayments";
import { useMutation, useQuery } from "@tanstack/react-query";
import { _useAllBusiness } from "@/components/store/useAllBusiness";

const AvailableDays = dynamic(() => import("./availableDays"), {
  loading: () => <SkeletonLoader height={20} />,
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
  const { businessId, logoUrl } = useBusinessDetails((s) => ({
    businessId: s.businessDetails?.businessId,
    logoUrl: s.businessDetails?.logoUrl,
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
    claimCouponz,
    billData
  } = usePaymentStore((s) => ({
    billValue: s.billValue,
    claimedCoins: s.claimedCoins,
    setClaimedCoins: s.setClaimedCoins,
    setClaimCouponz: s.setClaimCouponz,
    claimCouponz: s.claimCouponz,
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
    onSuccess: (data) => {
      console.log(data);
    }
  })

  const [selectedCoupon, setSelectedCouponState] = useState(null);
  const { applyCouponz, setApplyCouponz, setIsLoading } = useCouponTemp(
    (s) => ({
      applyCouponz: s.applyCouponz,
      setApplyCouponz: s.setApplyCouponz,
      setIsLoading: s.setIsLoading,
    }),
  );

  const closeCouponz = useCallback(() => {
    setApplyCouponz(false);
  }, [setApplyCouponz]);

  const applyCoupon = useCallback(
    async (coupon) => {
      console.log("coupon", coupon?.conditions?.availability?.startTime);
      // if (
      //   coupon?.conditions?.availability?.startTime > 0 &&
      //   coupon?.conditions?.availability?.endTime > 0
      // ) {
      //   const currentTime = new Date();
      //   const currentHours = currentTime.getHours();
      //   const currentMinutes = currentTime.getMinutes();
      //   const [startHours, startMinutes] =
      //     coupon.conditions.availability.startTime.split(".");
      //   const [endHours, endMinutes] =
      //     coupon.conditions.availability.endTime.split(".");
      //   console.log(
      //     "currentHours",
      //     currentHours,
      //     "currentMinutes",
      //     currentMinutes,
      //     "startHours",
      //     startHours,
      //     "startMinutes",
      //     startMinutes,
      //     "endHours",
      //     endHours,
      //     "endMinutes",
      //     endMinutes,
      //   );
      //   const isWithinTimeRange =
      //     (currentHours > startHours ||
      //       (currentHours === startHours && currentMinutes >= startMinutes)) &&
      //     (currentHours < endHours ||
      //       (currentHours === endHours && currentMinutes <= endMinutes));
      //   console.log("isWithinTimeRange", isWithinTimeRange);
      //   if (!isWithinTimeRange) {
      //     return toast.info("Coupon is not applicable at this time");
      //   }
      // }
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
  }, [availedCoupon, claimCouponz]);

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
        } else {
          missingOut.push(coupon);
        }
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

  const ApplyCouponzz = () => {
    return (
      <section className="bg-[#F1F0F5] overflow-y-auto h-full py-4 relative inter hide-scrollbar">
        <section className="fixed top-0 z-20 flex justify-between w-full gap-4 p-2 bg-white">
          <article className="flex items-center gap-4">
            <button
              type="button"
              onClick={closeCouponz}
              className="py-2 rounded-full z-[60] px-4 text-black bg-[#ffffff70] border"
            >
              <BiArrowBack />
            </button>
            <article>
              <h1 className="text-lg text-black">Apply Couponz</h1>
              <p className="text-[10px] text-[#676769]">
                Bill Amount: ₹ {billValue}
              </p>
            </article>
          </article>
          <picture className="mr-6">
            <ShimmerImage src={logoUrl} alt="logoUrl" width={44} height={44} />
          </picture>
        </section>
        <br />
        <br />
        <h1 className="mx-4 mt-6 text-xs font-bold text-black">
          Great deals you get on this billing
        </h1>
        {greatDeals?.length > 0 ? (
          greatDeals?.map((coupon) => (
            <section
              key={coupon?._id}
              className="flex mx-4 my-4 rounded-2xl inter"
            >
              <article className="w-full px-2 py-4 text-black bg-white shadow-2xl rounded-2xl">
                <div
                  className={cn(
                    (availedCoupon?._id || billData?.couponId) === coupon?._id
                      ? "bg-[#00C37E]"
                      : "bg-[#9268EC]",
                    "h-4 -mx-2 -my-4 overflow-hidden rounded-t-2xl mb-2",
                  )}
                />
                <article className="flex items-center justify-between">
                  <h1 className="p-1 mt-1 text-sm font-bold leading-none">
                    {coupon?.name}
                    <AvailableDays coupon={coupon} />
                  </h1>
                  {(availedCoupon?._id || billData?.couponId) === coupon?._id ? (
                    <button
                      type="button"
                      className="text-[#f13f8a] text-sm mt-1 font-bold"
                      onClick={removeCoupon}
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => applyCoupon(coupon)}
                      className={cn(
                        "on_active_bounce text-[#9268EC] text-sm mt-1 font-bold",
                      )}
                    >
                      APPLY
                    </button>
                  )}
                </article>
                <div className="relative z-10 gap-2 px-1 mt-2">
                  <div className="flex flex-col items-start space-y-1">
                    <p className="text-xs font-semibold text-[#00C37E]">
                      Get{" "}
                      {formatDiscount(
                        coupon?.config?.value,
                        coupon?.config?.discountType,
                      )}{" "}
                      off on this bill
                    </p>
                  </div>
                  <hr
                    className="w-full col-span-2 my-3 -mx-2"
                    style={{
                      backgroundImage: `url(\"data:image/svg+xml,%3csvg width='100%25' height='1' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='6' fill='none' stroke='${encodeURIComponent(
                        "#000000",
                      )}' stroke-width='4' stroke-dasharray='6%2c 14' stroke-dashoffset='10' stroke-linecap='square'/%3e%3c/svg%3e\")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "center",
                      height: "3px",
                      border: "none",
                    }}
                  />
                  <div className="flex flex-col items-start space-y-1">
                    <h3 className="text-xs text-[#858585]">
                      Use this coupon & get{" "}
                      {formatDiscount(
                        coupon?.config?.value,
                        coupon?.config?.discountType,
                      )}{" "}
                      off on bill above ₹ {coupon?.conditions?.billValue}.
                      Maximum discount: {coupon?.config?.upto}
                    </h3>
                  </div>
                </div>
              </article>
            </section>
          ))
        ) : (
          <center className="mt-6 text-xs text-black">
            No Eligible Couponz
          </center>
        )}
        {missingOut?.length > 0 && (
          <>
            <h1 className="mx-4 mt-8 text-xs font-bold text-black">
              Coupons you are missing out
            </h1>
            {missingOut.map((coupon) => (
              <section
                key={coupon?._id}
                className="flex mx-4 my-4 rounded-2xl inter"
              >
                <article className="w-full px-2 py-4 text-black bg-white shadow-2xl rounded-2xl">
                  <div className="h-4 bg-[#858585] -mx-2 -my-4 overflow-hidden rounded-t-2xl mb-2" />
                  <article className="flex items-center justify-between">
                    <h1 className="text-[#858585] p-1 mt-1 text-sm font-bold leading-none">
                      {coupon?.name}
                      <AvailableDays coupon={coupon} />
                    </h1>
                    <button
                      type="button"
                      className="text-[#858585] mt-1 text-sm font-bold"
                      disabled
                    >
                      APPLY
                    </button>
                  </article>
                  <div className="relative z-10 gap-2 px-1 mt-2">
                    <div className="flex flex-col items-start space-y-1">
                      <p className="text-xs font-semibold text-[#f13f8a]">
                        Add ₹ {coupon?.conditions?.billValue - billValue} more
                        to get{" "}
                        {formatDiscount(
                          coupon?.config?.value,
                          coupon?.config?.discountType,
                        )}{" "}
                        off on this bill
                      </p>
                    </div>
                    <hr
                      className="w-full col-span-2 my-3 -mx-2"
                      style={{
                        backgroundImage: `url(\"data:image/svg+xml,%3csvg width='100%25' height='1' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='6' fill='none' stroke='${encodeURIComponent(
                          "#000000",
                        )}' stroke-width='4' stroke-dasharray='6%2c 14' stroke-dashoffset='10' stroke-linecap='square'/%3e%3c/svg%3e\")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        height: "3px",
                        border: "none",
                      }}
                    />
                    <div className="flex flex-col items-start space-y-1">
                      <h3 className="text-xs text-[#858585]">
                        Use this coupon & get{" "}
                        {formatDiscount(
                          coupon?.config?.value,
                          coupon?.config?.discountType,
                        )}{" "}
                        off on bill above ₹ {coupon?.conditions?.billValue}.
                        Maximum discount: {coupon?.config?.upto}
                      </h3>
                    </div>
                  </div>
                </article>
              </section>
            ))}
          </>
        )}
        {upcomingCouponz?.length > 0 && (
          <>
            <h1 className="mx-4 mt-8 text-xs font-bold text-black">
              Upcoming Couponz
            </h1>
            {upcomingCouponz?.map((coupon) => (
              <section
                key={coupon?._id}
                className="flex mx-4 my-4 rounded-2xl inter"
              >
                <article className="w-full px-2 py-4 text-black bg-white shadow-2xl rounded-2xl">
                  <div className="h-4 bg-[#858585] -mx-2 -my-4 overflow-hidden rounded-t-2xl mb-2" />
                  <article className="flex items-center justify-between">
                    <h1 className="text-[#858585] p-1 mt-1 text-sm font-bold leading-none">
                      {coupon?.name}
                      <AvailableDays coupon={coupon} />
                    </h1>
                    <button
                      type="button"
                      className="text-[#858585] mt-1 text-xs font-bold"
                      disabled
                    >
                      Available From{" "}
                      {formatDate(coupon?.conditions?.couponStartDate)}
                    </button>
                  </article>
                  <div className="relative z-10 gap-2 px-1 mt-2">
                    <hr
                      className="w-full col-span-2 my-3 -mx-2"
                      style={{
                        backgroundImage: `url(\"data:image/svg+xml,%3csvg width='100%25' height='1' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='6' fill='none' stroke='${encodeURIComponent(
                          "#000000",
                        )}' stroke-width='4' stroke-dasharray='6%2c 14' stroke-dashoffset='10' stroke-linecap='square'/%3e%3c/svg%3e\")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        height: "3px",
                        border: "none",
                      }}
                    />
                    <div className="flex flex-col items-start space-y-1">
                      <h3 className="text-xs text-[#858585]">
                        Use this coupon & get{" "}
                        {formatDiscount(
                          coupon?.config?.value,
                          coupon?.config?.discountType,
                        )}{" "}
                        off on bill above ₹ {coupon?.conditions?.billValue}.
                        Maximum discount: {coupon?.config?.upto}
                      </h3>
                    </div>
                  </div>
                </article>
              </section>
            ))}
          </>
        )}
      </section>
    );
  };

  return (
    <>
      {showPopup ? <ApplyCouponDatePopup /> : <ApplyCouponzz />}
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
