import { lazy, memo, Suspense } from "react";
import Baloons from "@/assets/coupon/baloons.png";
import Birthday from "@/assets/coupon/Birth Day.png";
import Heading from "@/assets/coupon/heading.png";
import leftCoupon from "@/assets/coupon/left_ticket.png";
import RightCoupon from "@/assets/coupon/right_ticket.png";
import roll from "@/assets/coupon/roll.png";
import WineGlasses from "@/assets/coupon/Wine glass.png";
import Sunlight from "@/assets/Ellipse 1-min.png";
import Floor from "@/assets/floor.png";
import useCouponsStore from "@/components/store/useCouponsStore";
import { motion } from "framer-motion";
import { IoIosArrowForward } from "react-icons/io";
import LoadingSpinner from "@/components/atom/loadingSpinner";
const ListCoupons = lazy(() => import("./listCoupons"));
const BottomButton = lazy(() => import("@/components/atom/bottomButton"));

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
    <Suspense fallback={<LoadingSpinner />}>
      <section className="min-h-[90dvh]">
        <section className="relative z-0 mx-auto flex h-[10.5rem] w-full max-w-[30rem] items-center justify-center overflow-hidden bg-[#6a32df]">
          <motion.figure
            className="absolute -left-0 top-0 z-10 w-[40%]"
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <img width={202} height={117} src={leftCoupon} alt="leftCoupon" />
          </motion.figure>

          <motion.figure
            className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 !transform"
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
            className="absolute -right-4 z-10 w-[40%]"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          >
            <img width={202} height={117} src={RightCoupon} alt="RightCoupon" />
          </motion.figure>
        </section>

        <div className="relative mx-auto w-full max-w-[30rem]">
          <img src={Floor} alt="Floor" className="w-full bg-[#6A32DF10]" />
          <button
            type="button"
            onClick={() => setSelectedPage("ANALYTICS")}
            className="absolute left-1/2 top-0 flex -translate-x-1/2 text-white -translate-y-1/2 transform items-center justify-center rounded-2xl border border-[#6A32DF] bg-black px-4 py-1 text-sm "
          >
            Analytics
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
                className="relative h-[6.25rem] w-full max-w-[5.5rem] rounded-xl bg-[#6A32DF]"
              >
                <h3 className="absolute left-2 top-2 w-[85%] text-left text-sm font-semibold leading-[1.125rem] text-white">
                  {card.title}
                </h3>
                <img
                  className="absolute bottom-0 right-0 w-16 h-16"
                  src={card.image}
                  alt={card.title}
                />
                <div className="absolute bottom-2 left-1 flex text-[#FFB747]">
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
              text: "Create Coupons",
              onClick: () => setSelectedPage("CREATE"),
            },
          ]}
          fixed
        />
      </section>
    </Suspense>
  );
};

const Manage = memo(MemoManage);

export default Manage;
