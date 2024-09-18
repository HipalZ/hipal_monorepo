import Heading from "@/assets/coupon/heading.png";
import RightCoupon from "@/assets/coupon/right_ticket.png";
import leftCoupon from "@/assets/coupon/left_ticket.png";
import { memo } from "react";
import Sunlight from "@/assets/Ellipse 1-min.png";
import Floor from "@/assets/floor.png";
import Baloons from "@/assets/coupon/baloons.png";
import Birthday from "@/assets/coupon/Birth Day.png";
import roll from "@/assets/coupon/roll.png";
import WineGlasses from "@/assets/coupon/Wine glass.png";
import { motion } from "framer-motion";
import { IoIosArrowForward } from "react-icons/io";
import BottomButton from "@/components/atom/bottomButton";
import useCouponsStore from "@/components/store/useCouponsStore";
import ListCoupons from "./listCoupons";

const couponCards = [
  {
    title: "Birthdays",
    image: Birthday,
  },
  {
    title: "Friends & Family",
    image: Baloons,
  },
  {
    title: "Special Days",
    image: roll,
  },
  {
    title: "Party Discounts",
    image: WineGlasses,
  },
];
const arrow1Variants = {
  initial: { opacity: 0.3 },
  animate: {
    opacity: [1, 0.3],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
      times: [0, 1],
    },
  },
};

const arrow2Variants = {
  initial: { opacity: 0.3 },
  animate: {
    opacity: [0.3, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
      delay: 0.1,
      times: [0, 1],
    },
  },
};

const MemoManage = () => {
  const { setSelectedPage, setCouponName } = useCouponsStore((s) => ({
    setSelectedPage: s.setSelectedPage,
    setCouponName: s.setCouponName,
  }));

  const createCouponFunc = (title: string) => {
    setCouponName(title);
    setSelectedPage("DETAILS");
  };
  return (
    <section className="min-h-[90dvh]">
      <section className="w-full max-w-[30rem] overflow-hidden mx-auto z-0 h-[10.5rem] bg-[#6a32df] relative flex justify-center items-center">
        <motion.figure
          className="absolute top-0 -left-0 w-[40%] z-10"
          initial={{ x: "-100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <img width={202} height={117} src={leftCoupon} alt="leftCoupon" />
        </motion.figure>

        <motion.figure
          className="absolute !transform -translate-x-1/2 -translate-y-1/2 z-10 top-1/2 left-1/2"
          initial={{ scale: 0.25 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1, ease: "easeInOut", delay: 0.8 }}
        >
          <img width={202} height={117} src={Heading} alt="Heading" />
        </motion.figure>

        <motion.section
          className="absolute inset-0 z-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeInOut", delay: 1 }}
        >
          <motion.article
            className="absolute w-[300px]"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
          >
            <img
              width={1080}
              height={1080}
              src={Sunlight}
              alt="Sunlight"
              className="animate-glow"
            />
          </motion.article>
        </motion.section>

        <motion.figure
          className="absolute -right-4 w-[40%] z-10"
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          <img width={202} height={117} src={RightCoupon} alt="RightCoupon" />
        </motion.figure>
      </section>

      <div className="relative w-full max-w-[30rem] mx-auto">
        <img src={Floor} alt="Floor" className="w-full bg-[#6A32DF10]" />
        <button
          type="button"
          onClick={() => setSelectedPage("CREATE")}
          className="absolute top-0 transform  -translate-x-1/2 -translate-y-1/2 left-1/2 border border-[#6A32DF] bg-white text-[#6A32DF] py-1 px-4 rounded-2xl text-sm flex items-center justify-center"
        >
          Create Coupon
          <motion.div
            variants={arrow1Variants}
            initial="initial"
            animate="animate"
            className="ml-2"
          >
            <IoIosArrowForward />
          </motion.div>
          <motion.div
            variants={arrow2Variants}
            initial="initial"
            animate="animate"
            className="-ml-2"
          >
            <IoIosArrowForward />
          </motion.div>
        </button>
        <section className="absolute left-0 grid w-full grid-cols-4 gap-2 px-4 bottom-5">
          {couponCards.map((card) => (
            <button
              type="button"
              key={card.title}
              onClick={() => createCouponFunc(card.title)}
              className="bg-[#6A32DF] relative rounded-xl w-full max-w-[5.5rem] h-[6.25rem]"
            >
              <h3 className="absolute text-left leading-[1.125rem] text-white top-2 left-2 text-sm font-semibold w-[85%]">
                {card.title}
              </h3>
              <img
                className="absolute bottom-0 right-0 w-16 h-16"
                src={card.image}
                alt={card.title}
              />
              <div className="absolute flex bottom-2 left-1 text-[#FFB747]">
                <motion.div
                  variants={arrow1Variants}
                  initial="initial"
                  animate="animate"
                  className=""
                >
                  <IoIosArrowForward />
                </motion.div>
                <motion.div
                  variants={arrow2Variants}
                  initial="initial"
                  animate="animate"
                  className="-ml-2"
                >
                  <IoIosArrowForward />
                </motion.div>
              </div>
            </button>
          ))}
        </section>
      </div>
      <ListCoupons />
      <BottomButton
        buttons={[
          {
            text: "Analytics",
            onClick: () => setSelectedPage("CREATE"),
          },
          {
            text: "Create Coupons",
            onClick: () => setSelectedPage("CREATE"),
          },
        ]}
        fixed
      />
    </section>
  );
};

const Manage = memo(MemoManage);

export default Manage;
