import LoadingSpinner from "@/components/atom/loadingSpinner";
import useBusinessData from "@/components/store/useBusinessData";
import { useGetAllStaffReview } from "@/hooks/useReview";
import { motion, useAnimation } from "framer-motion";
import { memo, useEffect } from "react";
import { BsChevronRight } from "react-icons/bs";
import { FaSmile, FaSmileBeam } from "react-icons/fa";
import { PiSmileyAngryFill } from "react-icons/pi";

const MemoStar = () => {
  const { businessData } = useBusinessData();
  const { reviewsLoading, staffReviewsData } = useGetAllStaffReview();
  const controls = useAnimation();

  useEffect(() => {
    controls.start((i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1 },
    }));
  }, [controls]);

  if (reviewsLoading) return <LoadingSpinner />;

  return (
    <section className="w-full px-4 mx-auto mt-16 max-w-7xl">
      <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {staffReviewsData.map((staff, index) => (
          <motion.div
            key={staff._id}
            className={`relative flex flex-col items-stretch justify-between w-full overflow-hidden rounded-2xl shadow-lg transition-all duration-300 ease-in-out ${
              index === 0
                ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
                : "bg-white hover:shadow-xl"
            }`}
            initial={{ opacity: 0, y: 50 }}
            animate={controls}
            custom={index}
            whileHover={{ scale: 1.03 }}
          >
            {index === 0 && (
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <motion.path
                  d="M0,0 L100,0 L100,100 L0,100 Z"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  vectorEffect="non-scaling-stroke"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <defs>
                  <linearGradient
                    id="gradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#FCD34D" />
                    <stop offset="50%" stopColor="#F97316" />
                    <stop offset="100%" stopColor="#FCD34D" />
                  </linearGradient>
                </defs>
              </svg>
            )}
            <div className="flex items-center p-6 space-x-4">
              {businessData && businessData?.logo && (
                <img
                  src={businessData?.logo}
                  alt="Business logo"
                  className="object-cover w-12 h-12 border-2 border-gray-200 rounded-full"
                />
              )}

              <h2 className="text-lg font-semibold truncate">{staff.name}</h2>
            </div>
            <div className="flex items-center justify-around p-4 bg-black bg-opacity-10">
              <ReviewItem
                icon={<FaSmileBeam className="text-yellow-400" />}
                count={staff["5"]}
                label="Excellent"
              />
              <ReviewItem
                icon={<FaSmile className="text-orange-400" />}
                count={staff["3"]}
                label="Good"
              />
              <ReviewItem
                icon={<PiSmileyAngryFill className="text-red-500" />}
                count={staff["1"]}
                label="Poor"
              />
            </div>
            <button
              type="button"
              className={`flex items-center justify-center w-full py-3 mt-2 text-sm font-medium transition-colors duration-200 ${
                index === 0
                  ? "bg-white bg-opacity-20 text-white hover:bg-opacity-30"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
              aria-label={`View details for ${staff.name}`}
            >
              View Details
              <BsChevronRight className="ml-2" />
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const ReviewItem = ({ icon, count, label }) => (
  <div className="flex flex-col items-center">
    <div className="mb-1 text-3xl">{icon}</div>
    <div className="text-lg font-bold">{count}</div>
    <div className="text-xs opacity-70">{label}</div>
  </div>
);

const Star = memo(MemoStar);
export default Star;
