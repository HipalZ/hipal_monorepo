"use client";
import Image from "next/image";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { BiArrowBack } from "react-icons/bi";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import useCouponTemp from "@/components/store/useCouponTemp";
import { useCouponz } from "@/components/store/useCouponz";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import {
  calculateDiscount,
  cn,
  formatDiscount,
  ICouponPage,
} from "@/components/utils/helpers";
import { toast } from "react-toastify";
import confetti from "canvas-confetti";
import { apiRpc } from "@hi/common";
import { useLogin } from "@/components/store/useLogin";
import { useQuery } from "@tanstack/react-query";
import ApplyCouponDatePopup from "../newPayment/datePopup";
import AlertToRemove from "@/components/atoms/alertToRemove";
import { DialogTitle } from "@headlessui/react";
import { GoAlert } from "react-icons/go";
import { IoCheckmark } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";

const MemoApplyCouponz = () => {
  const logoUrl = useBusinessDetails(
    (state) => state?.businessDetails?.logoUrl,
  );

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

  const { setCurrentPage } = useCouponz((s) => ({
    setCurrentPage: s.setCurrentPage,
  }));

  const { showPopup, setShowPopup } = useCouponTemp((s) => ({
    showPopup: s.showPopup,
    setShowPopup: s.setShowPopup,
  }));

  const { billValue, setClaimCouponz, claimedCoinz, setClaimedCoinz } =
    usePaymentStore((s) => ({
      billValue: s.billValue,
      claimedCoinz: s.claimedCoinz,
      setClaimedCoinz: s.setClaimedCoinz,
      setClaimCouponz: s.setClaimCouponz,
    }));

  const {
    availedCoupon,
    setAvailedCoupon,
    setDirection,
    setCouponOccasion,
    userCouponz,
    setUserCouponz,
    setSelectedCoupon,
  } = useCouponz((s) => ({
    availedCoupon: s.availedCoupon,
    setAvailedCoupon: s.setAvailedCoupon,
    setDirection: s.setDirection,
    setCouponOccasion: s.setCouponOccasion,
    userCouponz: s.userCouponz,
    setUserCouponz: s.setUserCouponz,
    setSelectedCoupon: s.setSelectedCoupon,
  }));

  const { applyCouponz, setApplyCouponz } = useCouponTemp((s) => ({
    applyCouponz: s.applyCouponz,
    setApplyCouponz: s.setApplyCouponz,
  }));

  const closeCouponz = useCallback(() => {
    setApplyCouponz(false);
  }, [applyCouponz]);

  const [selectedCoupon, setSelectedCouponState] = useState(null);

  const applyCoupon = useCallback(
    async (coupon) => {
      // Check if bill value is less than coupon value
      if (coupon?.conditions?.billValue > billValue)
        return toast.info("Bill value is less than coupon value");

      if (claimedCoinz > 0) {
        setSelectedCouponState(coupon);
        setShowAlert(true);
        return;
      }

      await applyCouponLogic(coupon);
    },
    [billValue, claimedCoinz, setShowAlert],
  );

  const replaceLoyalty = useCallback(async () => {
    setClaimedCoinz(0);
    setShowAlert(false);
    toast.success("Coinz removed successfully");
    if (selectedCoupon) {
      await applyCouponLogic(selectedCoupon);
    }
  }, [setClaimedCoinz, setShowAlert, selectedCoupon]);

  const applyCouponLogic = useCallback(
    async (coupon) => {
      // Check if bill value is less than coupon value
      if (coupon?.conditions?.billValue > billValue)
        return toast.info("Bill value is less than coupon value");
      let response: any;
      const requiredFields = coupon?.conditions?.requiredFields || [];
      const requiresDobOrSpecialDay =
        requiredFields.includes("dob") || requiredFields.includes("specialday");
      if (requiresDobOrSpecialDay) {
        response = await apiRpc.couponz["check-grabbed-couponz"].$post({
          json: {
            couponId: availedCoupon?._id || coupon?._id,
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
        return;
      }
      // any condition apply the coupon
      const { discountValue, resetClaimedCoinz } = calculateDiscount(
        coupon,
        billValue,
        claimedCoinz,
      );

      setClaimCouponz(discountValue);
      if (resetClaimedCoinz) {
        setClaimedCoinz(0);
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
      claimedCoinz,
      setDirection,
      setClaimCouponz,
      setClaimedCoinz,
      setApplyCouponz,
      setAvailedCoupon,
    ],
  );

  // if availedCoupon from the apply couponz then calculate the discount

  useEffect(() => {
    if (availedCoupon?._id) {
      const { discountValue, resetClaimedCoinz } = calculateDiscount(
        availedCoupon,
        billValue,
        claimedCoinz,
      );

      setClaimCouponz(discountValue);
      if (resetClaimedCoinz) {
        setClaimedCoinz(0);
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
      setUserCouponz(res.data);
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

  // Filter and group coupons
  const greatDeals = useMemo(
    () =>
      userCouponz.filter(
        (coupon) => billValue >= coupon?.conditions?.billValue,
      ),
    [userCouponz, billValue],
  );
  const missingOut = useMemo(
    () =>
      userCouponz.filter((coupon) => billValue < coupon?.conditions?.billValue),
    [userCouponz, billValue],
  );

  const ApplyCouponzz = () => {
    return (
      <section className="bg-[#F1F0F5] overflow-y-auto min-h-[50dvh] h-full py-4 relative inter">
        <>
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
              <Image src={logoUrl} alt="logoUrl" width={44} height={44} />
            </picture>
          </section>
          <br />
          <br />
          {greatDeals?.length > 0 ? (
            <h1 className="mx-4 mt-6 text-xs font-bold text-black">
              Great deals you get on this billing
            </h1>
          ) : null}
          {greatDeals.map((coupon) => (
            <section
              key={coupon?._id}
              className="flex mx-4 my-4 rounded-2xl inter"
            >
              <article className="w-full px-2 py-4 text-black bg-white shadow-2xl rounded-2xl">
                <div
                  className={cn(
                    availedCoupon?._id === coupon?._id
                      ? "bg-[#00C37E]"
                      : "bg-[#9268EC]",
                    "h-4 -mx-2 -my-4 overflow-hidden rounded-t-2xl mb-2",
                  )}
                />
                <article className="flex items-center justify-between">
                  <h1 className="p-1 mt-1 text-sm font-bold leading-none">
                    {coupon?.name}
                  </h1>
                  {availedCoupon?._id === coupon?._id ? (
                    <button
                      type="button"
                      className="text-[#00C37E] text-sm mt-1 font-bold"
                      disabled
                    >
                      APPLIED
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => applyCoupon(coupon)}
                      className="on_active_bounce text-[#9268EC] text-sm mt-1 font-bold"
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
          ))}
          {missingOut?.length > 0 ? (
            <h1 className="mx-4 mt-8 text-xs font-bold text-black">
              Coupons you are missing out
            </h1>
          ) : null}
          {missingOut.map((coupon) => (
            <section
              key={coupon?._id}
              className="flex mx-4 my-4 rounded-2xl inter"
            >
              <article className="w-full px-2 py-4 text-black bg-white shadow-2xl rounded-2xl">
                <div className="h-4 bg-[#f13f8a] -mx-2 -my-4 overflow-hidden rounded-t-2xl mb-2" />
                <article className="flex items-center justify-between">
                  <h1 className="text-[#858585] p-1 mt-1 text-sm font-bold leading-none">
                    {coupon?.name}
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
                      Add ₹ {coupon?.conditions?.billValue - billValue} more to
                      get{" "}
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
      </section>
    );
  };

  return (
    <>
      <div>{showPopup ? <ApplyCouponDatePopup /> : <ApplyCouponzz />}</div>
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
              Remove
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
