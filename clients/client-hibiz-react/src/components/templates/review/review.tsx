import { useState, lazy, memo, useMemo, useCallback } from "react";
import { FaSmileBeam, FaSmile, FaFilter } from "react-icons/fa";
import { TbMailOpenedFilled } from "react-icons/tb";
import { IoIosMail } from "react-icons/io";
import { PiSmileyAngryFill } from "react-icons/pi";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import { useGetAllUsersReview } from "@/hooks/useReview";
import type { ReviewsType } from "@hi/db-models/src/validators";
import { useReview } from "@/components/store/useReview";
import { getReviewAttributes } from "@/components/utils/helper";
import { apiRpc } from "@hi/common";
import { FaArrowRightLong } from "react-icons/fa6";
import cn from "classnames"; // Assuming you are using 'classnames'
import { HiX } from "react-icons/hi";
import BottomButton from "@/components/atom/bottomButton";

const DateRangePicker = lazy(
  () => import("@/components/molecules/dateRangePicker"),
);

const MemoReview = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const { reviewsData, reviewsLoading } = useGetAllUsersReview(pageNumber);
  const { setReview, setPage } = useReview((s) => ({
    setReview: s.setReview,
    setPage: s.setPage,
  }));

  // Filter states
  const [priceSort, setPriceSort] = useState<"none" | "asc" | "desc">("none");
  const [seenFilter, setSeenFilter] = useState<"all" | "seen" | "unseen">(
    "all",
  );
  const [reviewRatingFilter, setReviewRatingFilter] = useState<
    "all" | 1 | 3 | 5
  >("all");

  const updateSeenStatus = async (reviewId: string) => {
    await apiRpc.reviews[":reviewId"].$get({
      param: { reviewId },
    });
  };

  const saveReview = (review: ReviewsType) => {
    setReview(review);
    setPage("user");
    if (review.seen) return;
    updateSeenStatus(review._id);
  };

  const togglePriceSort = (newSort: "asc" | "desc") => {
    setPriceSort(priceSort === newSort ? "none" : newSort);
  };

  const toggleSeenFilter = (newFilter: "seen" | "unseen") => {
    setSeenFilter(seenFilter === newFilter ? "all" : newFilter);
  };

  const toggleReviewRatingFilter = (newRating: 1 | 3 | 5) => {
    setReviewRatingFilter(reviewRatingFilter === newRating ? "all" : newRating);
  };

  const filteredReviews = useMemo(() => {
    if (!reviewsData) return [];

    let filtered = [...reviewsData];

    if (seenFilter === "seen") {
      filtered = filtered.filter((review) => review.seen);
    } else if (seenFilter === "unseen") {
      filtered = filtered.filter((review) => !review.seen);
    }

    if (priceSort === "asc") {
      filtered.sort((a, b) => a.order_id?.total - b.order_id?.total);
    } else if (priceSort === "desc") {
      filtered.sort((a, b) => b.order_id?.total - a.order_id?.total);
    }

    // Apply review rating filter
    if (reviewRatingFilter !== "all") {
      filtered = filtered.filter(
        (review) => review.reviewRating === reviewRatingFilter,
      );
    }

    return filtered;
  }, [reviewsData, priceSort, seenFilter, reviewRatingFilter]);

  const goToNextPage = () => {
    setPageNumber((prev) => prev + 1);
  };

  const goToPreviousPage = useCallback(() => {
    setPageNumber((prev) => (prev > 1 ? prev - 1 : prev));
  }, []);

  if (reviewsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <section className="mt-12 lg:mt-0">
      <section className="relative flex flex-col justify-between">
        <DateRangePicker />
        <div className="absolute top-0 flex justify-end pr-0 mt-4 right-4 lg:mx-0">
          <Menu as="div" className="relative inline-block text-left">
            <MenuButton className="inline-flex justify-center w-full py-1.5 pl-2 text-sm font-medium text-white bg-black rounded-md hover:bg-opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
              <FaFilter className="w-3 h-3 mr-2" />
            </MenuButton>
            <MenuItems className="absolute right-0 w-56 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="px-1 py-1">
                <MenuItem>
                  {({ focus }) => (
                    <button
                      type="button"
                      className={cn(
                        "relative group flex justify-between rounded-md items-center w-full px-2 py-2 text-sm",
                        focus ? "bg-black text-white" : "text-gray-900",
                        priceSort === "desc" ? "bg-black text-white" : "",
                      )}
                      onClick={() => togglePriceSort("desc")}
                    >
                      Price: High to Low
                      {priceSort === "desc" && (
                        <span className="absolute top-0 right-0 text-xs text-white bg-red-500 rounded-full">
                          <HiX />
                        </span>
                      )}
                    </button>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ focus }) => (
                    <button
                      type="button"
                      className={cn(
                        "relative group flex justify-between rounded-md items-center w-full px-2 py-2 text-sm",
                        focus ? "bg-black text-white" : "text-gray-900",
                        priceSort === "asc" ? "bg-black text-white" : "",
                      )}
                      onClick={() => togglePriceSort("asc")}
                    >
                      Price: Low to High
                      {priceSort === "asc" && (
                        <span className="absolute top-0 right-0 text-xs text-white bg-red-500 rounded-full">
                          <HiX />
                        </span>
                      )}
                    </button>
                  )}
                </MenuItem>
              </div>
              <div className="px-1 py-1">
                <MenuItem>
                  {({ focus }) => (
                    <button
                      type="button"
                      className={cn(
                        "relative group flex justify-between rounded-md items-center w-full px-2 py-2 text-sm",
                        focus ? "bg-black text-white" : "text-gray-900",
                        seenFilter === "seen" ? "bg-black text-white" : "",
                      )}
                      onClick={() => toggleSeenFilter("seen")}
                    >
                      Seen
                      {seenFilter === "seen" && (
                        <span className="absolute top-0 right-0 text-xs text-white bg-red-500 rounded-full">
                          <HiX />
                        </span>
                      )}
                    </button>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ focus }) => (
                    <button
                      type="button"
                      className={cn(
                        "relative group flex justify-between rounded-md items-center w-full px-2 py-2 text-sm",
                        focus ? "bg-black text-white" : "text-gray-900",
                        seenFilter === "unseen" ? "bg-black text-white" : "",
                      )}
                      onClick={() => toggleSeenFilter("unseen")}
                    >
                      Un-Seen
                      {seenFilter === "unseen" && (
                        <span className="absolute top-0 right-0 text-xs text-white bg-red-500 rounded-full">
                          <HiX />
                        </span>
                      )}
                    </button>
                  )}
                </MenuItem>
              </div>
              <div className="px-1 py-1">
                <MenuItem>
                  {({ focus }) => (
                    <button
                      type="button"
                      className={cn(
                        "relative group flex justify-between rounded-md items-center w-full px-2 py-2 text-sm",
                        focus ? "bg-black text-white" : "text-gray-900",
                        reviewRatingFilter === 5 ? "bg-black text-white" : "",
                      )}
                      onClick={() => toggleReviewRatingFilter(5)}
                    >
                      Best
                      {reviewRatingFilter === 5 && (
                        <span className="absolute top-0 right-0 text-xs text-white bg-red-500 rounded-full">
                          <HiX />
                        </span>
                      )}
                    </button>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ focus }) => (
                    <button
                      type="button"
                      className={cn(
                        "relative group flex justify-between rounded-md items-center w-full px-2 py-2 text-sm",
                        focus ? "bg-black text-white" : "text-gray-900",
                        reviewRatingFilter === 3 ? "bg-black text-white" : "",
                      )}
                      onClick={() => toggleReviewRatingFilter(3)}
                    >
                      Average
                      {reviewRatingFilter === 3 && (
                        <span className="absolute top-0 right-0 text-xs text-white bg-red-500 rounded-full">
                          <HiX />
                        </span>
                      )}
                    </button>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ focus }) => (
                    <button
                      type="button"
                      className={cn(
                        "relative group flex justify-between rounded-md items-center w-full px-2 py-2 text-sm",
                        focus ? "bg-black text-white" : "text-gray-900",
                        reviewRatingFilter === 1 ? "bg-black text-white" : "",
                      )}
                      onClick={() => toggleReviewRatingFilter(1)}
                    >
                      Bad
                      {reviewRatingFilter === 1 && (
                        <span className="absolute top-0 right-0 text-xs text-white bg-red-500 rounded-full">
                          <HiX />
                        </span>
                      )}
                    </button>
                  )}
                </MenuItem>
              </div>
            </MenuItems>
          </Menu>
        </div>
      </section>

      {filteredReviews.length !== 0 ? (
        <section className="grid grid-cols-1 gap-4 pb-[5rem] mx-4 mt-4 lg:mx-0 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {filteredReviews.map((review) => (
            <article
              key={review?._id}
              className="flex items-center p-2.5 bg-white rounded-xl justify-evenly cursor-pointer"
              onClick={() => saveReview(review)}
              onKeyDown={() => saveReview(review)}
            >
              {review.seen ? (
                <TbMailOpenedFilled className="w-12 h-6" />
              ) : (
                <IoIosMail className="w-12 h-6" />
              )}

              {review?.reviewRating === 5 ? (
                <FaSmileBeam color="#ffc30B" className="w-24 h-12 -ml-2" />
              ) : review?.reviewRating === 3 ? (
                <FaSmile color="#f47c3c" className="w-24 h-12 -ml-2" />
              ) : review?.reviewRating === 1 ? (
                <PiSmileyAngryFill className="h-14 text-[4.75rem] text-red-700 mr-1" />
              ) : null}

              <h3 className="text-sm font-semibold w-[60%]">
                {getReviewAttributes(review).join(" ")}
              </h3>

              <section className="text-center w-22">
                <h3 className="mb-2 font-semibold">
                  ₹ {review?.order_id?.total}
                </h3>
                <button
                  type="button"
                  className="flex items-center px-2 py-1 text-[0.625rem] text-white bg-black text-nowrap rounded-3xl"
                >
                  Check out
                  <FaArrowRightLong className="ml-2" />
                </button>
              </section>
            </article>
          ))}
        </section>
      ) : (
        <section className="mt-12 text-xl text-center text-semibold">
          No reviews found
        </section>
      )}
      <button
        type="button"
        className="fixed z-50 w-9 h-9 bottom-12 transform -translate-x-1/2 -translate-y-1/2 left-1/2 rounded-full text-white bg-[#8C63FF]"
      >
        {pageNumber}
      </button>
      <BottomButton
        fixed
        buttons={[
          {
            text: "Previous Page",
            onClick: goToPreviousPage,
            disable: pageNumber === 1,
          },
          {
            text: "Next Page",
            onClick: goToNextPage,
            disable: reviewsData?.length < 20 || false,
          },
        ]}
      />
    </section>
  );
};

const ReviewSection = memo(MemoReview);
export default ReviewSection;
