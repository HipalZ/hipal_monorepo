import type { BusinessDetails } from "@/components/types/businessData";
import { getTimeIn12HrFormat } from "@/components/utils/helpers";
import { memo, useCallback } from "react";

function RestaurantTime({
  business,
}: { business: BusinessDetails | undefined }) {
  const getTodayTiming = useCallback(() => {
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const today = new Date().getDay();
    const todayName = daysOfWeek[today];

    const customTimings =
      business?.customTiming && business.customTiming.length > 0
        ? business.customTiming
        : [
            {
              day: "Monday",
              openTime: business?.fixOpenTime,
              closeTime: business?.fixCloseTime,
            },
            {
              day: "Tuesday",
              openTime: business?.fixOpenTime,
              closeTime: business?.fixCloseTime,
            },
            {
              day: "Wednesday",
              openTime: business?.fixOpenTime,
              closeTime: business?.fixCloseTime,
            },
            {
              day: "Thursday",
              openTime: business?.fixOpenTime,
              closeTime: business?.fixCloseTime,
            },
            {
              day: "Friday",
              openTime: business?.fixOpenTime,
              closeTime: business?.fixCloseTime,
            },
            {
              day: "Saturday",
              openTime: business?.fixOpenTime,
              closeTime: business?.fixCloseTime,
            },
            {
              day: "Sunday",
              openTime: business?.fixOpenTime,
              closeTime: business?.fixCloseTime,
            },
          ];

    const todayTiming = customTimings.find(
      (timing) => timing.day === todayName,
    );

    const openFrom = todayTiming?.openTime || business?.fixOpenTime;
    const openTill = todayTiming?.closeTime || business?.fixCloseTime;

    return { openFrom, openTill };
  }, [business?.customTiming, business?.fixOpenTime, business?.fixCloseTime]);

  const { openFrom, openTill } = getTodayTiming();
  return (
    <>
      {openFrom && openTill ? (
        <div className="my-auto text-xs">
          &#x23F3; {getTimeIn12HrFormat(openFrom)}
          {openFrom && openTill && " - "}
          {getTimeIn12HrFormat(openTill)}
        </div>
      ) : null}
    </>
  );
}

const RestaurantTimeMemo = memo(RestaurantTime);
export default RestaurantTimeMemo;
