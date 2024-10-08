"use client";
import { memo, useCallback, useRef } from "react";
import Image from "next/image";
import baloons from "@/assets/img/baloons_birthday.png";
import cake from "@/assets/img/cake.png";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import Picker from "react-scrollable-picker";
import { BiArrowBack } from "react-icons/bi";
import {
  cn,
  convertToTimestamp,
  getHueColor,
  ICouponPage,
  triggerConfettiBlast,
} from "@/components/utils/helpers";
import { useCouponz } from "@/components/store/useCouponz";
import { apiRpc } from "@hi/common";
import { useLogin } from "@/components/store/useLogin";
import { useParams, useRouter } from "next/navigation";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import useCouponTemp from "@/components/store/useCouponTemp";
import useDatePicker from "@/components/hooks/useDatePicker";
import { useErrorHandling } from "@/utils/helper";
import { toast } from "react-toastify";

const MemoApplyCouponDatePopup = () => {
  const { errorText } = useErrorHandling();
  const { businessDetails } = useBusinessDetails((s) => ({
    businessDetails: s.businessDetails,
  }));
  const router = useRouter();
  const customLink = useParams()?.businessId;
  const { billValue } = usePaymentStore((s) => ({
    billValue: s.billValue,
  }));
  const { userDetails } = useLogin((s) => ({
    userDetails: s.userDetails,
  }));
  const { availedCoupon, setCurrentPage, couponOccasion } = useCouponz((s) => ({
    availedCoupon: s.availedCoupon,
    setCurrentPage: s.setCurrentPage,
    couponOccasion: s.couponOccasion,
  }));

  const { setShowPopup, setApplyCouponz } = useCouponTemp((s) => ({
    showPopup: s.showPopup,
    setShowPopup: s.setShowPopup,
    setApplyCouponz: s.setApplyCouponz,
  }));

  const todayDate = new Date();
  const pickerRef = useRef<HTMLDivElement>(null);

  const currentYear = todayDate.getFullYear();
  const currentMonth = todayDate.getMonth() + 1;
  const currentDay = todayDate.getDate();
  // Use the custom hook
  const { date, optionGroups, handleDateChange } = useDatePicker(
    currentYear,
    currentMonth,
    currentDay,
    pickerRef,
  );
  const handleBack = useCallback(() => {
    setShowPopup(false);
    return router.push(`/${customLink}/payment?amount=${billValue}`);
  }, [customLink, billValue]);

  const handleSubmit = async () => {
    let response: any;
    let result: any;
    if (couponOccasion === "dob") {
      response = await apiRpc.couponz["grabbed-couponz"].$post({
        json: {
          businessId: businessDetails?.businessId,
          couponId: availedCoupon?._id,
          userId: userDetails?._id,
          dob: convertToTimestamp(date),
        },
      });
      result = await response.json();
    } else if (couponOccasion === "specialday") {
      response = await apiRpc.couponz["grabbed-couponz"].$post({
        json: {
          businessId: businessDetails?.businessId,
          couponId: availedCoupon?._id,
          userId: userDetails?._id,
          specialday: convertToTimestamp(date),
        },
      });
      result = await response.json();
    }
    if (response.status === 401) {
      return errorText(response.status);
    }
    if (response.status === 201) {
      triggerConfettiBlast();
      toast.success("Grabbed successfully apply couponz");
      setShowPopup(false);
      setApplyCouponz(false);
    } else if (response.status === 400 || response.status === 409) {
      triggerConfettiBlast();
      setCurrentPage(ICouponPage.SINGLECOUPON);
      setShowPopup(false);
      if (result?.message.includes("E11000 duplicate key error collection")) {
        toast.error("You have already availed this coupon, reapply the coupon");
      }
      setApplyCouponz(false);
      toast.success("Grabbed successfully apply couponz");
      router.push(`/${customLink}/payment?amount=${billValue}`);
    }
  };

  return (
    <main className="h-[100dvh] relative z-[50] max-w-[30rem]">
      <button
        onClick={handleBack}
        type="button"
        className="top-4 left-4 py-2 rounded-full absolute z-[60] px-4 text-black bg-[#ffffff70]"
      >
        <BiArrowBack />
      </button>

      <Image
        src={baloons}
        alt="baloons"
        className="absolute top-0 z-10 w-full -mt-12"
      />
      <Image
        src={cake}
        alt="cake"
        className="absolute w-full top-12 h-[62vh]"
        style={{
          filter: `hue-rotate(${getHueColor(availedCoupon?.bgColour)}deg)`,
        }}
      />
      <section
        className="w-full md:min-w-[28rem] max-w-[calc(100%-2rem)] md:max-w-fit min-h-[20rem] rounded-t-2xl fixed left-1/2 transform -translate-x-1/2 bottom-0 flex justify-center"
        style={{
          background: `linear-gradient(180deg, ${
            availedCoupon?.bgColour || "#9267EC"
          } 0%, #1A1A1A 65%)`,
        }}
      >
        <article className="flex flex-col items-center -mt-10 transform">
          <Image
            src={businessDetails?.logoUrl}
            alt="logo"
            width={90}
            height={90}
            className={cn(
              "bg-white",
              "object-cover w-20 h-20 bg-center rounded-full",
            )}
          />
          <h1 className="mt-2 font-bold">
            Share Your {couponOccasion === "dob" ? "Birthday" : "Special Day"}
          </h1>
          <Picker
            optionGroups={optionGroups}
            valueGroups={date}
            onChange={handleDateChange}
            itemHeight={40}
            width={100}
            height={130}
            required
          />
          {couponOccasion === "dob" ? (
            <center className="text-[#CACACA] mx-6 text-sm">
              Note: DOB once set cannot be changed
            </center>
          ) : null}
          <button
            type="button"
            onClick={handleSubmit}
            className={`on_active_bounce bg-[${
              availedCoupon?.bgColour || "#9267EC"
            }] w-full py-2 rounded-full mt-2 fixed bottom-4 font-semibold`}
          >
            Submit
          </button>
        </article>
      </section>
    </main>
  );
};

const ApplyCouponDatePopup = memo(MemoApplyCouponDatePopup);
export default ApplyCouponDatePopup;
