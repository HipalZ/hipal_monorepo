"use client";
import React, { memo, useState, useEffect, useRef } from "react";
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
import toast from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import { usePaymentStore } from "@/components/store/usePaymentStore";
import useCouponTemp from "@/components/store/useCouponTemp";

const MemoOccasionPopup = () => {
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
  const {
    selectedCoupon,
    setCurrentPage,
    couponOccasion,
    direction,
    setAvailedCoupon,
  } = useCouponz((s) => ({
    selectedCoupon: s.selectedCoupon,
    setCurrentPage: s.setCurrentPage,
    couponOccasion: s.couponOccasion,
    direction: s.direction,
    setAvailedCoupon: s.setAvailedCoupon,
  }));

  const { setShowPopup } = useCouponTemp((s) => ({
    setShowPopup: s.setShowPopup,
  }));

  const todayDate = new Date();
  const pickerRef = useRef<HTMLDivElement>(null);

  const currentYear = todayDate.getFullYear();
  const currentMonth = todayDate.getMonth() + 1;
  const currentDay = todayDate.getDate();
  const [date, setDate] = useState({
    day: currentDay.toString(),
    month: currentMonth.toString(),
    year: currentYear.toString(),
  });

  const [optionGroups, setOptionGroups] = useState({
    day: Array.from({ length: 31 }, (_, i) => ({
      value: `${i + 1}`,
      label: `${i + 1}`,
    })),
    month: Array.from({ length: 12 }, (_, i) => ({
      value: `${i + 1}`,
      label: new Date(0, i).toLocaleString("default", { month: "long" }),
    })),
    year: Array.from({ length: 200 }, (_, i) => ({
      value: `${currentYear - i}`,
      label: `${currentYear - i}`,
    })),
  });

  useEffect(() => {
    const selectedYear = Number.parseInt(date.year);
    const selectedMonth = Number.parseInt(date.month);
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

    setOptionGroups((prev) => ({
      ...prev,
      day: Array.from({ length: daysInMonth }, (_, i) => ({
        value: `${i + 1}`,
        label: `${i + 1}`,
      })),
      month:
        selectedYear === currentYear
          ? prev.month.slice(0, currentMonth)
          : prev.month,
    }));
  }, [date.year, date.month]);

  const handleDateChange = (name, value) => {
    setDate((prev) => {
      // Copy previous state
      let newState = { ...prev, [name]: value };

      // Determine the number of days in the newly selected month and year
      const daysInMonth = new Date(
        Number.parseInt(newState.year),
        Number.parseInt(newState.month),
        0,
      ).getDate();

      // If the currently selected day is greater than the number of days in the new month, reset to the max day of that month
      if (Number.parseInt(prev.day) > daysInMonth) {
        newState.day = `${daysInMonth}`;
      }

      // Handle month and year specific updates for options
      if (name === "month" || name === "year") {
        const newMonthOptions =
          Number.parseInt(newState.year) === currentYear
            ? optionGroups.month.slice(0, currentMonth)
            : optionGroups.month;

        const newDayOptions =
          Number.parseInt(newState.year) === currentYear &&
          Number.parseInt(newState.month) === currentMonth
            ? Array.from({ length: currentDay }, (_, i) => ({
                value: `${i + 1}`,
                label: `${i + 1}`,
              }))
            : Array.from({ length: daysInMonth }, (_, i) => ({
                value: `${i + 1}`,
                label: `${i + 1}`,
              }));

        setOptionGroups({
          ...optionGroups,
          day: newDayOptions,
          month: newMonthOptions,
        });
      }

      return newState;
    });
  };

  const handleBack = () => {
    if (direction === "payment") {
      return router.push(`/${customLink}/payment?amount=${billValue}`);
    }
    setCurrentPage(ICouponPage.SINGLECOUPON);
  };

  const handleSubmit = async () => {
    let response: any;
    if (couponOccasion === "dob") {
      response = await apiRpc.couponz["grabbed-couponz"].$post({
        json: {
          businessId: businessDetails?.businessId,
          couponId: selectedCoupon?._id,
          userId: userDetails?._id,
          dob: convertToTimestamp(date),
        },
      });
    } else if (couponOccasion === "specialday") {
      response = await apiRpc.couponz["grabbed-couponz"].$post({
        json: {
          businessId: businessDetails?.businessId,
          couponId: selectedCoupon?._id,
          userId: userDetails?._id,
          specialday: convertToTimestamp(date),
        },
      });
    }
    if (response.status === 201) {
      toast.success("Coupon grabbed successfully");
      setCurrentPage(ICouponPage.CONGRATULATIONZ);
      setAvailedCoupon(selectedCoupon);
      triggerConfettiBlast();
      setShowPopup(false);
    } else if (response.status === 400) {
      setAvailedCoupon(selectedCoupon);
      triggerConfettiBlast();
      setCurrentPage(ICouponPage.SINGLECOUPON);
      setShowPopup(false);
    }
  };

  useEffect(() => {
    const preventDefault = (e: TouchEvent) => e.preventDefault();

    const pickerElement = pickerRef.current;
    if (pickerElement) {
      pickerElement.addEventListener("touchmove", preventDefault, {
        passive: false,
      });
    }

    return () => {
      if (pickerElement) {
        pickerElement.removeEventListener("touchmove", preventDefault);
      }
    };
  }, []);

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
          filter: `hue-rotate(${getHueColor(selectedCoupon?.bgColour)}deg)`,
        }}
      />
      <section
        className="w-full md:min-w-[28rem] max-w-[calc(100%-2rem)] md:max-w-fit min-h-[20rem] rounded-t-2xl fixed left-1/2 transform -translate-x-1/2 bottom-0 flex justify-center"
        style={{
          background: `linear-gradient(180deg, ${selectedCoupon?.bgColour} 0%, #1A1A1A 65%)`,
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
          <div ref={pickerRef}>
            <Picker
              optionGroups={optionGroups}
              valueGroups={date}
              onChange={handleDateChange}
              itemHeight={30}
              height={130}
              className="custom-picker"
              style={{
                width: "fit-content",
                height: "100%",
              }}
              required
            />
          </div>
          {couponOccasion === "dob" ? (
            <center className="text-[#CACACA] mx-6 text-sm">
              Note: DOB once set cannot be changed
            </center>
          ) : null}
          <button
            type="button"
            onClick={handleSubmit}
            className={`on_active_bounce bg-[${selectedCoupon?.bgColour}] w-full py-2 rounded-full mt-2 fixed bottom-4 font-semibold`}
          >
            Submit
          </button>
        </article>
      </section>
    </main>
  );
};

const OccasionPopup = memo(MemoOccasionPopup);
export default OccasionPopup;
