"use client";
import ReadMore from "@/components/atoms/readMore";
import { memo, useCallback } from "react";
import type { IBusinessData } from "@/components/types/businessData";
import { GrLocation } from "react-icons/gr";
import { MdOutlineCall } from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";

interface IHeroSection {
  data: IBusinessData;
}

function HeroSection({ data }: IHeroSection): JSX.Element {
  const { location, phone } = data.outletInfo;
  const goToLocation = useCallback(() => {
    if (typeof window === "undefined") return;
    window.open(location, "_blank");
  }, [location]);
  const callTheOwner = useCallback(() => {
    if (typeof window === "undefined") return;
    window.open(`tel:${phone}`);
  }, [phone]);
  const whatsappOwner = useCallback(() => {
    if (typeof window === "undefined") return;
    window.open(`https://wa.me/+91${phone}`);
  }, [phone]);
  return (
    <div className="relative items-center px-8">
      <center
        style={{
          justifyContent: "flex-end",
        }}
        className="pt-8 space-y-3 text-sm text-center text-primary"
      >
        <section className="flex flex-row justify-around">
          <button
            onClick={callTheOwner}
            className="p-4 rounded-full text-base-100 bg-primary"
            type="button"
          >
            <MdOutlineCall size="24" />
          </button>
          <button
            onClick={whatsappOwner}
            className="p-4 rounded-full text-base-100 bg-primary"
            type="button"
          >
            <FaWhatsapp size="24" />
          </button>
          <button
            onClick={goToLocation}
            className="p-4 rounded-full bg-primary text-base-100"
            type="button"
          >
            <GrLocation size="24" />
          </button>
        </section>
        <center className="pt-4 text-2xl text-center text-primary">
          About us
        </center>
        <ReadMore text={data?.business?.description || ""} className="text-center line-clamp-3" />
      </center>
    </div>
  );
}

const MemoHeroSection = memo(HeroSection);
export default MemoHeroSection;
