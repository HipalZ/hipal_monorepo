import { useExploreTemp } from "@/components/store/useExploreTemp";
import { memo } from "react";
import { useBizInfoChanges } from "../../helpers/bizInforHelpers";
import { Switch } from "@headlessui/react";
import { convertTo12HourFormat } from "../settingsForm/outletForm";

const MemoCustomTimings = () => {
  const { fixedTime, showCustomTime, customTimings, setShowCustomTime } =
    useExploreTemp((s) => ({
      fixedTime: s.fixedTime,
      showCustomTime: s.showCustomTime,
      customTimings: s.customTimings,
      setShowCustomTime: s.setShowCustomTime,
    }));
  const { handleCustomTimingChange, handleFixedTimeChange } =
    useBizInfoChanges();
  return (
    <>
      <center className="my-2 text-2xl">Business Timings</center>
      <h1 className="my-2">Fixed Timings:</h1>
      <section className="p-4 my-2 space-y-4 bg-white rounded-xl">
        <div className="flex items-center justify-between">
          <label htmlFor="fixedOpenTime">Open Time:</label>
          <input
            type="time"
            id="fixedOpenTime"
            value={fixedTime?.openTime}
            onChange={(e) => handleFixedTimeChange("openTime", e.target.value)}
            className="rounded-full w-[10rem]"
          />
        </div>
        <div className="flex items-center justify-between">
          <label htmlFor="fixedCloseTime">End Time:</label>
          <input
            type="time"
            id="fixedCloseTime"
            value={fixedTime?.closeTime}
            onChange={(e) => handleFixedTimeChange("closeTime", e.target.value)}
            className="rounded-full w-[10rem]"
          />
        </div>
        {(fixedTime?.openTime || fixedTime?.closeTime) && (
          <div className="px-4 py-1 text-sm text-[#8C63FF] bg-[#8C63FF20] rounded-full">
            Business time from {convertTo12HourFormat(fixedTime?.openTime)} to{" "}
            {convertTo12HourFormat(fixedTime?.closeTime)}
          </div>
        )}
      </section>
      <section className="flex items-center justify-between p-4 my-4 bg-white rounded-xl">
        <h1>Custom Timings</h1>
        <Switch
          checked={showCustomTime}
          onChange={setShowCustomTime}
          className="group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition data-[checked]:bg-green-400"
        >
          <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-[checked]:translate-x-6" />
        </Switch>
      </section>
      {showCustomTime && (
        <section className="my-4 bg-white rounded-2xl">
          {customTimings?.map((timing, index) => (
            <article
              key={`timing${index.toString()}`}
              className="flex items-center justify-between p-2 my-2"
            >
              <h1 className="w-[3rem]">{timing?.day?.slice(0, 3)}</h1>
              <input
                type="time"
                id={`customTimingOpen${index}`}
                value={timing.openTime}
                onChange={(e) =>
                  handleCustomTimingChange(index, "openTime", e.target.value)
                }
                className="rounded-full w-[8rem]"
              />
              <input
                type="time"
                id={`customTimingClose${index}`}
                value={timing.closeTime}
                onChange={(e) =>
                  handleCustomTimingChange(index, "closeTime", e.target.value)
                }
                className="rounded-full w-[8rem]"
              />
            </article>
          ))}
        </section>
      )}
    </>
  );
};

const CustomTimings = memo(MemoCustomTimings);
export default CustomTimings;
