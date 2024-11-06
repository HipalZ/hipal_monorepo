import { useState, useCallback, useMemo, useEffect } from "react";
import BottomButton from "@/components/atom/bottomButton";
import { type ReviewModel, useReview } from "@/components/store/useReview";
import { FaSmile, FaSmileBeam } from "react-icons/fa";
import { PiSmileyAngryFill } from "react-icons/pi";
import PopUp from "@/components/atom/popUp";
import AddCoinzReview from "./addCoinz";
import AddCouponsReview from "./addCouponsReview";
import { MdArrowBack } from "react-icons/md";
import useCouponsStore from "@/components/store/useCouponsStore";
import useBusinessData from "@/components/store/useBusinessData";
import { useCreateReviewTemplate } from "@/hooks/useReview";
import { getReviewAttributes } from "@/components/utils/helper";
import LoadingSpinner from "@/components/atom/loadingSpinner";

export default function ReviewComponent() {
  const {
    review,
    modelType,
    open,
    setModelType,
    setOpen,
    amount,
    coin,
    password,
  } = useReview((state) => ({
    review: state.review,
    modelType: state.modelType,
    open: state.open,
    coin: state.coinz,
    password: state.password,
    amount: state.amount,
    setOpen: state.setOpen,
    setModelType: state.setModelType,
  }));

  const { couponStartDate, couponEndDate } = useCouponsStore();
  const existingLoyalty = useBusinessData((state) => state.existingLoyalty);
  const { businessData } = useBusinessData();
  const { createReview, isPending } = useCreateReviewTemplate();
  const [message, setMessage] = useState("");
  const [charCount, setCharCount] = useState(0);

  const businessId = businessData?._id;
  const businessName = businessData?.name;
  const customLink = businessData?.customLink;

  const userName = review?.userId?.name || "Customer";

  const getDynamicMessage = useCallback(() => {
    let dynamicPart = "";

    if (modelType === "COINS") {
      dynamicPart = `We are extending a token of appreciation by giving you ${coin} coins.`;
    } else if (modelType === "COUPONZ" && amount && couponEndDate) {
      const formattedExpiryDate = formatDate(couponEndDate);
      dynamicPart = `We are happy to offer you a special coupon worth ₹${amount}, valid until ${formattedExpiryDate}.`;
    } else {
      dynamicPart = "We appreciate your feedback.";
    }

    return `Hi *${userName}*,\n\nWe are so glad that you loved our service. We work really hard to make sure that we make your every visit special.\n\n${dynamicPart}\n\nMake sure to use our loyalty program to grab exclusive rewards on every billing.`;
  }, [modelType, userName, coin, amount, couponEndDate]);

  useEffect(() => {
    const newMessage = getDynamicMessage();
    setMessage(newMessage);
    setCharCount(newMessage.length);
  }, [modelType, getDynamicMessage]);

  const openModel = useCallback(
    (type: ReviewModel) => {
      if (type === modelType) return;
      setModelType(type);
      setOpen(true);
      useReview.getState().reset();
      useCouponsStore.getState().setCouponEndDate(null);
    },
    [modelType, setModelType, setOpen],
  );

  const handleMessageChange = useCallback((e) => {
    const newMessage = e.target.value.slice(0, 350);
    setMessage(newMessage);
    setCharCount(newMessage.length);
  }, []);

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
      day % 10 > 3 || Math.floor(day / 10) === 1 ? 0 : day % 10
    ];
    return `${day}${daySuffix} ${month} ${year} ${formattedHours}:${formattedMinutes} ${ampm}`;
  }, []);

  const formattedDate = useMemo(
    () => (review?.date ? formatDate(review.date) : ""),
    [review?.date, formatDate],
  );

  const closeModel = useCallback(() => setOpen(false), [setOpen]);

  const createPayload = useMemo(() => {
    const basePayload = {
      message,
      userId: review?.userId?._id,
      customLink,
      businessId,
      name: userName,
      businessName,
    };

    if (modelType === "COINS" && coin && password) {
      return {
        ...basePayload,
        coins: coin,
        password,
        loyaltyId: existingLoyalty.loyaltyId,
      };
    }

    if (modelType === "COUPONZ" && amount && couponStartDate && couponEndDate) {
      return { ...basePayload, amount, couponStartDate, couponEndDate };
    }

    return basePayload;
  }, [
    amount,
    businessId,
    businessName,
    coin,
    couponEndDate,
    couponStartDate,
    customLink,
    existingLoyalty.loyaltyId,
    message,
    modelType,
    password,
    userName,
    review?.userId,
  ]);

  const handleWhatsAppReply = useCallback(async () => {
    try {
      await createReview(createPayload);
    } catch (error) {
      console.error("Error sending review:", error);
    }
  }, [createReview, createPayload]);

  const getReviewAttribute = getReviewAttributes(review);

  if (isPending) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <section className="flex flex-col min-h-screen p-6 space-y-4 w-full max-w-[30rem] mx-auto">
        <section className="flex items-center justify-between gap-6 w-full max-w-[30rem] mx-auto">
          <article>
            <h3 className="mt-4 text-xl font-semibold">{userName}</h3>
            <h3 className="mt-2 text-base font-semibold">
              <span className="mr-2 text-sm opacity-50">{formattedDate} </span>
              <span>₹{review?.order_id?.total}</span>
            </h3>
          </article>
          {review?.reviewRating === 5 ? (
            <FaSmileBeam color="#ffc30B" className="text-[4rem]" />
          ) : review?.reviewRating === 3 ? (
            <FaSmile color="#f47c3c" className="text-[4rem]" />
          ) : (
            <PiSmileyAngryFill className=" text-[5rem] text-red-700" />
          )}
        </section>

        {getReviewAttribute.length > 0 && (
          <section className="flex items-center gap-4">
            {getReviewAttribute.map((item) => (
              <button
                key={item}
                type="button"
                className="px-4 py-2 text-xs text-white bg-black rounded-full"
              >
                {item}
              </button>
            ))}
          </section>
        )}

        <h6 className="mt-4 text-center">{review?.description}</h6>
        <div className="w-full">
          <textarea
            value={message}
            onChange={handleMessageChange}
            className="w-full h-[232px] md:h-[300px] p-4 border rounded-md resize-none font-sans text-sm leading-relaxed"
            maxLength={350}
            style={{
              whiteSpace: "pre-wrap",
              overflowWrap: "break-word",
            }}
          />
          <p className="text-sm text-right text-gray-500">{charCount}/350</p>
        </div>
        <section className="flex flex-wrap gap-2">
          <button
            onClick={() => openModel("COINS")}
            className="px-2.5 md:px-3.5 py-2 md:text-base text-xs bg-[#8C63FF] text-white rounded-3xl"
            type="button"
          >
            Add Coins
          </button>
          <button
            onClick={() => openModel("COUPONZ")}
            className="px-2.5 py-2 md:px-3.5 text-xs md:text-base bg-[#8C63FF] text-white rounded-3xl"
            type="button"
          >
            Add Couponz
          </button>
          <button
            type="button"
            className="px-2 md:px-3 py-2 text-xs md:text-base text-[#8C63FF] bg-[#e2e2e2] rounded-3xl"
          >
            Ask for Google Review
          </button>
        </section>
      </section>

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
          {modelType === "COINS" && <AddCoinzReview />}
          {modelType === "COUPONZ" && <AddCouponsReview />}
        </section>
      </PopUp>

      <BottomButton
        fixed
        buttons={[
          {
            text: isPending ? "Sending..." : "Reply on WhatsApp",
            onClick: handleWhatsAppReply,
            disable: isPending,
          },
        ]}
      />
    </>
  );
}
