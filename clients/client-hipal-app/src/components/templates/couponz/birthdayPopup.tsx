"use client";
import React, { memo, useState } from "react";
import Image from "next/image";
import baloons from "@/assets/img/baloons_birthday.png";
import cake from "@/assets/img/cake.png";
import useBusinessDetails from "@/components/store/useBusinessDetails";
import Picker from "react-scrollable-picker";
import Link from "next/link";
import { BiArrowBack } from "react-icons/bi";
import { useParams } from "next/navigation";
import { colors } from "@/components/utils/helpers";

const getTodayDate = () => {
  const today = new Date();
  const day = today.getDate().toString();
  const month = today.toLocaleString("default", { month: "long" });
  const year = today.getFullYear().toString();
  return { day, month, year };
};

const MemoBirthdayPopup = () => {
  const { businessDetails } = useBusinessDetails((s) => ({
    businessDetails: s.businessDetails,
  }));
  const customLink = useParams()?.businessId as string;

  const todayDate = getTodayDate();

  const [valueGroups, setValueGroups] = useState({
    day: todayDate.day,
    month: todayDate.month,
    year: todayDate.year,
  });

  const [optionGroups] = useState({
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
    setValueGroups((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <main className="h-[100dvh] relative z-[50] max-w-[30rem]">
      <Link href={`/${customLink}/explore`}>
        <button
          type="button"
          className="top-4 left-4 py-2 rounded-full absolute z-[60] px-4 text-black bg-[#ffffff70]"
        >
          <BiArrowBack />
        </button>
      </Link>
      <Image
        src={baloons}
        alt="baloons"
        className="absolute top-0 z-10 w-full -mt-12"
      />
      <Image
        src={cake}
        alt="cake"
        className="absolute w-full top-12 h-[62vh]"
        style={{ filter: `hue-rotate(${colors[2]?.hueRotate}deg)` }}
      />
      <section
        className="w-full md:min-w-[28rem] max-w-[calc(100%-2rem)] md:max-w-fit min-h-[20rem] rounded-t-2xl fixed left-1/2 transform -translate-x-1/2 bottom-0 flex justify-center"
        style={{
          background: `linear-gradient(180deg, ${colors[2]?.color} 0%, #1A1A1A 65%)`,
        }}
      >
        <article className="flex flex-col items-center -mt-10 transform">
          <Image
            src={businessDetails?.logoUrl}
            alt="logo"
            width={90}
            height={90}
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
          />
          <center className="text-[#CACACA] mx-6 text-sm">
            Note: DOB once set cannot be changed
          </center>
          <button
            type="button"
            className={`on_active_bounce bg-[${colors[2]?.color}] w-full py-2 rounded-full mt-2 fixed bottom-4 font-semibold`}
          >
            Submit
          </button>
        </article>
      </section>
    </main>
  );
};

const BirthdayPopup = memo(MemoBirthdayPopup);
export default BirthdayPopup;
