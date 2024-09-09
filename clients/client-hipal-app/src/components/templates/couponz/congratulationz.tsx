"use client";
import React, { memo, useEffect, useState } from "react";
import Image from "next/image";
import confetti from "canvas-confetti";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BiArrowBack } from "react-icons/bi";
import Sunrays from "@/assets/img/sunrays_white.png";
import birthdayPlaceholder from "@/assets/img/birthdayCouponz.png";
import { cn, colors } from "@/components/utils/helpers";
import CouponCardCongrats from "@/components/atoms/couponCardCongrats";

const MemoCongratulationz = () => {
  const customLink = useParams()?.businessId as string;
  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }
  const [colorIndex, setColorIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setColorIndex((prevIndex) => (prevIndex + 1) % colors.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  function triggerConfettiBlast() {
    confetti({
      angle: randomInRange(55, 125),
      spread: randomInRange(50, 70),
      particleCount: randomInRange(50, 100),
      origin: { y: 0.6 },
    });
  }

  useEffect(() => {
    triggerConfettiBlast();
  }, []);

  return (
    <main
      className={cn(
        colors[colorIndex]?.bgColor,
        colors[colorIndex]?.textColor,
        "h-[100vh] relative z-50 max-w-[30rem] overflow-hidden",
      )}
    >
      <Link href={`/${customLink}/explore`}>
        <button
          type="button"
          className="top-4 left-4 py-2 rounded-full absolute z-[60] px-4 text-black bg-[#ffffff70]"
        >
          <BiArrowBack />
        </button>
      </Link>
      <section
        className={cn(
          colors[colorIndex]?.textColor,
          "absolute inset-0 custom-top-congratulationz space-grotesk-700",
        )}
      >
        <svg title="Curve" viewBox="0 0 500 500">
          <path
            id="curve"
            fill="transparent"
            d="M73.2,148.6c4-6.1,65.5-96.8,178.6-95.6c111.3,1.2,170.8,90.3,175.1,97"
          />
          <text width="500">
            <textPath
              xlinkHref="#curve"
              startOffset="52%"
              textAnchor="middle"
              style={{
                fontSize: "36px",
                letterSpacing: "0.1em",
              }}
            >
              Congratulationz !
            </textPath>
          </text>
        </svg>
      </section>
      <CouponCardCongrats />
      <section className="absolute inset-0 flex items-center justify-center rotate-12">
        <center className="relative z-50 w-64 shadow-2xl rounded-xl">
          <div className="rounded-t-xl w-[16rem] h-[11rem] bg-[#FCC13D]" />
          <div className="relative min-h-[7rem] max-h-full z-10 bg-[#FCC13D] rounded-2xl shadow-2xl" />
        </center>
      </section>
      <section className="absolute inset-0 flex items-center justify-center -rotate-12">
        <center className="relative z-50 w-64 shadow-2xl rounded-xl">
          <div className="rounded-t-xl w-[16rem] h-[11rem] bg-[#C8AAEE] shadow-2xl" />
          <div className="relative min-h-[7rem] max-h-full z-10 bg-[#C8AAEE] rounded-2xl shadow-2xl" />
        </center>
      </section>
      <center
        className={cn(
          colors[colorIndex]?.textColor,
          "absolute text-2xl transform -translate-x-1/2 custom-bottom-congratulationz left-1/2 w-full",
        )}
      >
        You have won !!!
      </center>
      <button
        type="button"
        className="absolute w-[92%] mx-4 text-white bg-black rounded-full btn bottom-4"
      >
        See my couponz
      </button>
    </main>
  );
};

const Congratulationz = memo(MemoCongratulationz);
export default Congratulationz;
