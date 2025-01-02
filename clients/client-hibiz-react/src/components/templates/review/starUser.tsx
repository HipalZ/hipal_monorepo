import { memo, useCallback, useMemo, useState } from "react";
import BottomButton from "@/components/atom/bottomButton";
import useBusinessData from "@/components/store/useBusinessData";
import { useReview } from "@/components/store/useReview";
import { getReviewAttributes } from "@/components/utils/helper";
import { FaGift, FaSmile, FaSmileBeam } from "react-icons/fa";
import { PiSmileyAngryFill } from "react-icons/pi";
import PopUp from "@/components/atom/popUp";
import { MdArrowBack, MdCalendarToday } from "react-icons/md";
import AddCouponsReview from "./addCouponsReview";
import useCouponsStore from "@/components/store/useCouponsStore";
import { motion } from "framer-motion";

const StarUser = memo(() => {
  const logo = useBusinessData((state) => state.businessData?.logo);
  const [isOpen, setIsOpen] = useState(false);
  const { setPage, review, open, setOpen, amount } = useReview((s) => ({
    setPage: s.setPage,
    review: s.review,
    open: s.open,
    setOpen: s.setOpen,
    amount: s.amount,
  }));
  const { couponStartDate, couponEndDate } = useCouponsStore();

  const closeModel = useCallback(() => setOpen(false), [setOpen]);

  const sendMessage = useCallback(() => {
    setPage("message");
  }, [setPage]);

  const formatDate = useCallback((timestamp: number) => {
    const date = new Date(timestamp);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "Pm" : "Am";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, "0");

    const daySuffix = ["th", "st", "nd", "rd"][
      day % 10 > 3 || day / 10 === 1 ? 0 : day % 10
    ];

    return `${day}${daySuffix} ${month} ${year} ${formattedHours}:${formattedMinutes} ${ampm}`;
  }, []);

  const formattedDate = useMemo(
    () => (review?.date ? formatDate(review.date) : ""),
    [review?.date, formatDate],
  );
  const getReviewAttribute = getReviewAttributes(review);
  return (
    <section className="flex flex-col items-center space-y-4 justify-center px-6 pb-[5rem] mt-6 w-full max-w-[30rem] mx-auto">
      <img src={logo} alt="logo" className="w-12 h-12 rounded-xl" />
      <h3 className="mt-4 text-xl font-semibold">{review?.userId?.name}</h3>
      <h3 className="mt-2 text-base font-semibold opacity-80">
        {formattedDate}
      </h3>
      {review?.reviewRating === 5 ? (
        <FaSmileBeam color="#ffc30B" className="text-[7rem] -ml-2" />
      ) : review?.reviewRating === 3 ? (
        <FaSmile color="#f47c3c" className="text-[7rem] -ml-2" />
      ) : review?.reviewRating === 1 ? (
        <PiSmileyAngryFill className=" text-[8rem] text-red-700 mr-1" />
      ) : null}
      <section className="flex gap-4 justify-evenly">
        {getReviewAttribute.length > 0 &&
          getReviewAttribute.map((item) => (
            <button
              key={item}
              type="button"
              className="px-4 py-2 text-xs text-white bg-black rounded-full"
            >
              {item}
            </button>
          ))}
      </section>
      <h6 className="mt-4 text-center">
        {review?.description || "No description"}
      </h6>
      {amount && couponStartDate && couponEndDate && (
        <div className="relative w-full max-w-xs mt-8">
          <motion.div
            className="relative w-full h-64 cursor-pointer"
            initial={false}
            animate={isOpen ? "open" : "closed"}
            onClick={() => setIsOpen(!isOpen)}
          >
            <motion.div
              className="absolute w-full h-full overflow-hidden shadow-lg bg-gradient-to-br from-purple-600 to-blue-500 rounded-xl"
              variants={{
                open: { rotateY: 180 },
                closed: { rotateY: 0 },
              }}
              transition={{ duration: 0.5 }}
            >
              {/* Front of the coupon (closed gift) */}
              <motion.div
                className="absolute flex items-center justify-center w-full h-full backface-hidden"
                variants={{
                  open: { opacity: 0 },
                  closed: { opacity: 1 },
                }}
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <FaGift className="text-6xl text-yellow-300" />
                </motion.div>
              </motion.div>

              {/* Back of the coupon (opened gift) */}
              <motion.div
                className="absolute w-full h-full p-6 backface-hidden"
                style={{ rotateY: 180 }}
                variants={{
                  open: { opacity: 1 },
                  closed: { opacity: 0 },
                }}
              >
                <h4 className="mb-4 text-2xl font-bold text-center text-white">
                  Your Special Coupon
                </h4>
                <motion.div
                  className=""
                  variants={{
                    open: {
                      transition: {
                        staggerChildren: 0.1,
                      },
                    },
                  }}
                >
                  <motion.div
                    className="flex items-center justify-between px-3 py-1.5 bg-white rounded-t-lg bg-opacity-20 backdrop-filter backdrop-blur-sm"
                    variants={{
                      open: { opacity: 1, y: 0 },
                      closed: { opacity: 0, y: 20 },
                    }}
                  >
                    <span className="font-semibold text-white">Amount:</span>
                    <span className="text-xl font-bold text-yellow-300">
                      ₹ {amount}
                    </span>
                  </motion.div>
                  <motion.div
                    className="flex items-center justify-between px-3 py-1.5 bg-white bg-opacity-20 backdrop-filter backdrop-blur-sm"
                    variants={{
                      open: { opacity: 1, y: 0 },
                      closed: { opacity: 0, y: 20 },
                    }}
                  >
                    <span className="font-semibold text-white">
                      Valid From:
                    </span>
                    <span className="font-semibold text-yellow-300">
                      {formatDate(couponStartDate)}
                    </span>
                  </motion.div>
                  <motion.div
                    className="flex items-center justify-between px-3 py-1.5 bg-white rounded-b-lg bg-opacity-20 backdrop-filter backdrop-blur-sm"
                    variants={{
                      open: { opacity: 1, y: 0 },
                      closed: { opacity: 0, y: 20 },
                    }}
                  >
                    <span className="font-semibold text-white">
                      Valid Until:
                    </span>
                    <span className="font-semibold text-yellow-300">
                      {formatDate(couponEndDate)}
                    </span>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Decorative elements */}
            <motion.div
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              variants={{
                open: { opacity: 1 },
                closed: { opacity: 0 },
              }}
            >
              <motion.div
                className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-yellow-300 rounded-tl-xl"
                variants={{
                  open: { x: 0, y: 0, opacity: 1 },
                  closed: { x: -20, y: -20, opacity: 0 },
                }}
              />
              <motion.div
                className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-yellow-300 rounded-tr-xl"
                variants={{
                  open: { x: 0, y: 0, opacity: 1 },
                  closed: { x: 20, y: -20, opacity: 0 },
                }}
              />
              <motion.div
                className="absolute bottom-0 left-0 w-20 h-20 border-b-4 border-l-4 border-yellow-300 rounded-bl-xl"
                variants={{
                  open: { x: 0, y: 0, opacity: 1 },
                  closed: { x: -20, y: 20, opacity: 0 },
                }}
              />
              <motion.div
                className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-yellow-300 rounded-br-xl"
                variants={{
                  open: { x: 0, y: 0, opacity: 1 },
                  closed: { x: 20, y: 20, opacity: 0 },
                }}
              />
            </motion.div>
          </motion.div>
        </div>
      )}
      {open && (
        <PopUp
          hide
          onClose={closeModel}
          show={open}
          width="w-[30rem]"
          height="h-[100dvh] lg:h-auto"
        >
          <section>
            <button
              type="button"
              onClick={closeModel}
              className="absolute top-5 left-6 bg-[#ffffff] rounded-2xl px-3 py-1"
            >
              <MdArrowBack />
            </button>
            <AddCouponsReview call />
          </section>
        </PopUp>
      )}
      {/* <BottomButton
        fixed
        buttons={[
          { text: "Assign Coupon", onClick: () => setOpen(true) },
          { text: "WatsApp", onClick: sendMessage },
        ]}
      /> */}
    </section>
  );
});

StarUser.displayName = "StarUser";

export default StarUser;
