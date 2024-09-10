"use client";
import React, { memo, useState } from "react";
import Image from "next/image";
import baloons from "@/assets/img/baloons_birthday.png";
import cake from "@/assets/img/cake.png";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import Picker from "react-scrollable-picker";
import { BiArrowBack } from "react-icons/bi";
import {
  cn,
  colors,
  convertToTimestamp,
  getHueColor,
  getTodayDate,
  ICouponPage,
} from "@/components/utils/helpers";
import { useCouponz } from "@/components/store/useCouponz";
import { apiRpc } from "@hi/common";
import { useLogin } from "@/components/store/useLogin";
import toast from "react-hot-toast";

const MemoBirthdayPopup = () => {
  const { businessDetails } = useBusinessDetails((s) => ({
    businessDetails: s.businessDetails,
  }));
  const { userDetails } = useLogin((s) => ({
    userDetails: s.userDetails,
  }));
  const [hasTransparentBg, setHasTransparentBg] = useState(true);
  const { selectedCoupon } = useCouponz((s) => ({
    selectedCoupon: s.selectedCoupon,
  }));

  const todayDate = getTodayDate();
  const { setCurrentPage } = useCouponz((s) => ({
    setCurrentPage: s.setCurrentPage,
  }));

  const [valueGroups, setValueGroups] = useState({
    day: todayDate.day,
    month: todayDate.month,
    year: todayDate.year,
  });

  const [optionGroups, setOptionGroups] = useState({
    day: Array.from({ length: 31 }, (_, i) => ({
      value: `${i + 1}`,
      label: `${i + 1}`,
    })),
    month: [
      { value: "January", label: "Jan" },
      { value: "February", label: "Feb" },
      { value: "March", label: "Mar" },
      { value: "April", label: "April" },
      { value: "May", label: "May" },
      { value: "June", label: "June" },
      { value: "July", label: "July" },
      { value: "August", label: "Aug" },
      { value: "September", label: "Sep" },
      { value: "October", label: "Oct" },
      { value: "November", label: "Nov" },
      { value: "December", label: "Dec" },
    ],
    year: Array.from({ length: 200 }, (_, i) => ({
      value: `${1900 + i}`,
      label: `${1900 + i}`,
    })),
  });

  const handleChange = (name, value) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // 0-based index
    const currentDay = currentDate.getDate();

    const newValueGroups = {
      ...valueGroups,
      [name]: value,
    };

    // Check if the selected date exceeds today's date
    const selectedDate = new Date(
      parseInt(newValueGroups.year),
      optionGroups.month.findIndex((m) => m.value === newValueGroups.month),
      parseInt(newValueGroups.day),
    );

    if (selectedDate > currentDate) {
      // Reset to today's date if the selected date exceeds today's date
      newValueGroups.day = `${currentDay}`;
      newValueGroups.month = optionGroups.month[currentMonth].value;
      newValueGroups.year = `${currentYear}`;
    }

    const filteredYears = optionGroups.year.filter(
      (year) => parseInt(year.value) <= currentYear,
    );

    const filteredMonths =
      newValueGroups.year === `${currentYear}`
        ? optionGroups.month.filter((month, index) => index <= currentMonth)
        : optionGroups.month;

    const filteredDays =
      newValueGroups.year === `${currentYear}` &&
      newValueGroups.month === optionGroups.month[currentMonth].value
        ? optionGroups.day.filter((day) => parseInt(day.value) <= currentDay)
        : optionGroups.day;

    setOptionGroups({
      day: filteredDays,
      month: filteredMonths,
      year: filteredYears,
    });

    setValueGroups(newValueGroups);
  };

  const handleBack = () => {
    setCurrentPage(ICouponPage.SINGLECOUPON);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await apiRpc.users.updateUserInfo[":userId"].$put({
      param: {
        userId: userDetails?._id,
      },
      json: {
        dob: convertToTimestamp(valueGroups),
      },
    });
    await response.json();
    if (response.status === 200 || response.status === 201) {
      console.log("respon", response);
      toast.success("Birthday updated successfully");
      setCurrentPage(ICouponPage.CONGRATULATIONZ);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
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
                hasTransparentBg ? "bg-white" : "",
                "object-cover w-20 h-20 bg-center rounded-full",
              )}
            />
            <h1 className="mt-2 font-bold">Share your Birthday</h1>
            <Picker
              optionGroups={optionGroups}
              valueGroups={valueGroups}
              onChange={handleChange}
              itemHeight={45}
              width={100}
              height={130}
              className="custom-picker"
              style={{
                width: "fit-content",
              }}
              required
            />
            <center className="text-[#CACACA] mx-6 text-sm">
              Note: DOB once set cannot be changed
            </center>
            <button
              type="submit"
              className={`on_active_bounce bg-[${selectedCoupon?.bgColour}] w-full py-2 rounded-full mt-2 fixed bottom-4 font-semibold`}
            >
              Submit
            </button>
          </article>
        </section>
      </main>
    </form>
  );
};

const BirthdayPopup = memo(MemoBirthdayPopup);
export default BirthdayPopup;
