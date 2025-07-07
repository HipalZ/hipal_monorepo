"use client";
import Lottie from "lottie-react";
import { memo } from "react";
import lottieBirthday from "@/assets/lottie/birthday.json";
import Image from "next/image";
import { LuArrowRight } from "react-icons/lu";
import Star from "@/assets/svg/Star.svg";
import { useBirthday } from "@/components/store/useBirthday";
import { useBirthdayConditions } from "@/components/utils/birthdayHelper";

const MemoBirthdayCard = () => {
  const { checkCardConditions } = useBirthdayConditions();
  const { setOpenModal } = useBirthday();
  const openBirthdayModal = () => {
    setOpenModal(true);
  };
  if (!checkCardConditions()) return null;
  return (
    <section className="px-4 pt-4">
      <article className="text-primary bg-base-200 w-full min-h-full max-h-[11rem] rounded-2xl p-4 flex relative overflow-hidden">
        <div className="z-10 space-y-2">
          <p className="text-primary relative inline-flex items-center text-xl font-bold">
            Earn Coinz{" "}
            <Image
              src={Star}
              alt="Star"
              width={8}
              height={8}
              className="absolute transform translate-x-1/2 -translate-y-1/2 -right-4 -top-1"
            />
            <Image
              src={Star}
              alt="Star"
              width={12}
              height={12}
              className="absolute transform translate-x-1/2 -translate-y-1/2 top-1 -right-2"
            />
          </p>
          <p className="text-sm">Claim your birthday rewards.</p>
          <button
            onClick={openBirthdayModal}
            type="button"
            className="flex items-center gap-1 rounded-md transition px-2 py-1.5 cursor-pointer group bg-primary text-base-200"
          >
            <span className="text-sm font-medium group-hover:underline">
              Claim Now
            </span>
            <LuArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform duration-200"
            />
          </button>
        </div>
        <div className="absolute top-0 -right-6 z-0 w-[10rem] h-full">
          <Lottie
            animationData={lottieBirthday}
            loop={true}
            style={{
              height: "150px",
              cursor: "pointer",
            }}
          />
        </div>
      </article>
    </section>
  );
};

const BirthdayCard = memo(MemoBirthdayCard);
export default BirthdayCard;
