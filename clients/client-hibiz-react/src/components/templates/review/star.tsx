import LoadingSpinner from "@/components/atom/loadingSpinner";
import useBusinessData from "@/components/store/useBusinessData";
import { useGetAllStaffReview } from "@/hooks/useReview";
import { cn } from "@hi/common";
import { memo } from "react";
import { BsChevronRight } from "react-icons/bs";
import { FaSmile, FaSmileBeam } from "react-icons/fa";
import { PiSmileyAngryFill } from "react-icons/pi";

const MemoStar = () => {
  const logo = useBusinessData((state) => state.businessData?.logo);
  const { reviewsLoading, staffReviewsData } = useGetAllStaffReview();

  if (reviewsLoading) return <LoadingSpinner />;

  return (
    <section className="mt-[4rem] px-4 w-full mx-auto lg:mx-0">
      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {staffReviewsData.map((staff, index) => (
          <div
            key={staff._id}
            style={{
              background:
                index === 0
                  ? "linear-gradient(313.39deg, #4E62FF 32.64%, #B494FF 103.13%)"
                  : undefined,
            }}
            className={cn(
              "relative flex items-center justify-between w-full space-x-1 overflow-hidden",
              index === 0 ? "p-4 rounded-3xl text-white" : "text-black",
            )}
          >
            <img
              src={logo}
              alt="logo"
              className="relative z-10 w-12 h-12 rounded-full"
            />
            {index === 0 && (
              <div className="opacity-20 -bottom-10 right-10 five-pointed-star" />
            )}
            {index === 0 && (
              <div className="opacity-20 -top-4 -left-4 five-pointed-star" />
            )}
            <h2 className="w-1/3 ml-2 font-semibold text-start">
              {staff.name}
            </h2>
            <article className="flex items-center gap-4 justify-evenly">
              <div className="text-center">
                <FaSmileBeam color="#ffc30B" className="text-[2rem]" />
                <h6 className="ml-1 text-xs opacity-70">{staff["5"]}</h6>
              </div>
              <div className="text-center">
                <FaSmile color="#f47c3c" className="text-[2rem]" />
                <h6 className="ml-1 text-xs opacity-70">{staff["3"]}</h6>
              </div>
              <div className="text-center">
                <PiSmileyAngryFill className="text-[2rem] text-red-700" />
                <h6 className="ml-1 text-xs opacity-70">{staff["1"]}</h6>
              </div>
            </article>
            <button
              type="button"
              className="w-8 h-16 border text-center border-[#ffffff] rounded-2xl ml-2 p-2"
            >
              <BsChevronRight strokeWidth="1" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

const Star = memo(MemoStar);
export default Star;
