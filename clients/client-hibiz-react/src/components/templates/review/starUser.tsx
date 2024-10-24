import { memo, useCallback, useMemo } from "react";
import BottomButton from "@/components/atom/bottomButton";
import useBusinessData from "@/components/store/useBusinessData";
import { useReview } from "@/components/store/useReview";
import { getReviewAttributes } from "@/components/utils/helper";
import { FaSmile, FaSmileBeam } from "react-icons/fa";
import { PiSmileyAngryFill } from "react-icons/pi";

const StarUser = memo(() => {
  const logo = useBusinessData((state) => state.businessData?.logo);
  const { setPage, review } = useReview((s) => ({
    setPage: s.setPage,
    review: s.review,
  }));

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
    <section className="flex flex-col items-center space-y-4 justify-center px-6 mt-6 w-full max-w-[30rem] mx-auto">
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
      <BottomButton
        fixed
        buttons={[{ text: "WatsApp", onClick: sendMessage }]}
      />
    </section>
  );
});

StarUser.displayName = "StarUser";

export default StarUser;
