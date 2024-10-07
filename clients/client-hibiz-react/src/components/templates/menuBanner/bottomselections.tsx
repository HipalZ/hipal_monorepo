import { memo, useCallback } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useMenuBanner } from "@/components/store/useMenuBanners";
import { useGetAllTimings } from "@/hooks/useMenuBanner";
import type { MenuBannerType } from "@hi/db-models/src/validators";
import LoadingSpinner from "@/components/atom/loadingSpinner";

const MemoBottomSelections = () => {
  const {
    setMenuBannerType,
    setHeaderTitle,
    headerTitle,
    isPublishing,
    setIsPublishing,
    setTimingId,
    setSelectedDishes,
  } = useMenuBanner((s) => ({
    headerTitle: s.headerTitle,
    isPublishing: s.isPublishing,
    setMenuBannerType: s.setMenuBannerType,
    setHeaderTitle: s.setHeaderTitle,
    setIsPublishing: s.setIsPublishing,
    setTimingId: s.setTimingId,
    setSelectedDishes: s.setSelectedDishes,
  }));

  const { isLoading, timings } = useGetAllTimings();

  const addDishes = useCallback(
    (timing: MenuBannerType) => {
      setMenuBannerType("CREATE");
      setIsPublishing(timing?.isPublished || false);
      setHeaderTitle(timing?.heading);
      setTimingId(timing?._id || "");
      setSelectedDishes(timing?.dishIds || []);
      console.log("timing", timing);
    },
    [headerTitle, isPublishing],
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <section className="w-full pb-[5rem] flex-1 max-w-[30rem]">
      <h3 className="mt-2 text-lg font-semibold opacity-50">
        Select a timing to view the menu
      </h3>
      {timings &&
        timings.length > 0 &&
        timings?.map((timing) => (
          <button
            type="button"
            key={timing._id}
            onClick={() => addDishes(timing)}
            className="flex items-center justify-between w-full px-4 py-3 mt-3 text-left bg-white rounded-lg shadow-md"
          >
            <section>
              <h2 className="text-base font-bold text-black space-grotesk-700">
                {timing.heading}
              </h2>

              <h3 className="text-sm opacity-60">
                Works between{" "}
                {new Date(timing?.startTime - 19800000).toLocaleTimeString(
                  "en-IN",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                    timeZone: "Asia/Kolkata",
                  },
                )}{" "}
                -{" "}
                {new Date(timing?.endTime - 19800000).toLocaleTimeString(
                  "en-IN",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                    timeZone: "Asia/Kolkata",
                  },
                )}
              </h3>
            </section>
            <p className="text-xs md:text-sm">
              {timing.isPublished ? (
                <FaEye className="text-green-400" size={16} />
              ) : (
                <FaEyeSlash className="text-red-500" size={16} />
              )}
            </p>
          </button>
        ))}
    </section>
  );
};

const BottomSelections = memo(MemoBottomSelections);
export default BottomSelections;
