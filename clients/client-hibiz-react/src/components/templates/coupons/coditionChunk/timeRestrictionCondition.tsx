import Background from "@/components/atom/feildBackground";
import { Switch } from "@headlessui/react";
import { memo, useCallback, useState } from "react";
import TimePicker from "../timePicker";
import useCouponsStore from "@/components/store/useCouponsStore";
import toast from "react-hot-toast";

const MemoTimeRestrictionCondition = () => {
  const {
    customDays,
    timeBasedRestriction,
    setTimeBasedRestriction,
    setExtendedEndTime,
    setStartTime,
    setEndTime,
    startTime,
    endTime,
    extendedEndTime,
    setAllowLateNight,
    allowLateNight,
  } = useCouponsStore((s) => ({
    customDays: s.customDays,
    timeBasedRestriction: s.timeBasedRestriction,
    setTimeBasedRestriction: s.setTimeBasedRestriction,
    setExtendedEndTime: s.setExtendedEndTime,
    setStartTime: s.setStartTime,
    setEndTime: s.setEndTime,
    startTime: s.startTime,
    endTime: s.endTime,
    extendedEndTime: s.extendedEndTime,
    setAllowLateNight: s.setAllowLateNight,
    allowLateNight: s.allowLateNight,
  }));

  const [errorMessage, setErrorMessage] = useState("");

  const handleLateNightCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAllowLateNight(e.target.checked);
    if (!e.target.checked) {
      setExtendedEndTime(endTime);
    }
  };

  const handleLateNightHoursChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = Math.max(0, Math.min(12, Number(e.target.value)));
    setExtendedEndTime(endTime + value);
  };

  const handleTimeChange = useCallback(
    (time: string, type: "start" | "end") => {
      const [hours, minutes] = time.split(":").map(Number);
      const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
      const timeInDecimal = `${hours}.${formattedMinutes}`;

      if (type === "end") {
        setExtendedEndTime(0);
      }

      if (type === "start") {
        setStartTime(Number(timeInDecimal));
      } else {
        if (Number(timeInDecimal) <= startTime) {
          setErrorMessage("End time should be greater than start time.");
          toast.error("End time should be greater than start time.");
        } else {
          setErrorMessage("");
          setEndTime(Number(timeInDecimal));
        }
      }
    },
    [startTime, setStartTime, setEndTime],
  );

  const handleTimeToggle = useCallback(() => {
    setTimeBasedRestriction(!timeBasedRestriction);
    setStartTime(0);
    setEndTime(0);
    setExtendedEndTime(0);
    setAllowLateNight(false);
  }, [
    timeBasedRestriction,
    setStartTime,
    setEndTime,
    setExtendedEndTime,
    setAllowLateNight,
  ]);

  return (
    <Background>
      <section className="flex items-center justify-between text-nowrap">
        <h3 className="font-semibold opacity-60">
          Add "Time" based restriction
        </h3>
        <Switch
          checked={timeBasedRestriction}
          onChange={handleTimeToggle}
          className="group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition data-[checked]:bg-green-400"
        >
          <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-[checked]:translate-x-6" />
        </Switch>
      </section>
      {timeBasedRestriction && (
        <>
          <h3 className="my-2 pb-2 text-xs font-semibold text-[#8C63FF]">
            Choose minimum one time*
          </h3>
          <TimePicker
            startTime={startTime}
            endTime={endTime}
            extendedEndTime={extendedEndTime}
            handleTimeChange={handleTimeChange}
            errorMessage={errorMessage}
          />
          {customDays.length === 1 && (
            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={allowLateNight}
                  onChange={handleLateNightCheckbox}
                  className="mr-2"
                />
                Allow late night billings after 12 - 3 AM night
              </label>
              {allowLateNight && (
                <div className="mt-2">
                  <Background>
                    <input
                      type="number"
                      value={
                        extendedEndTime > 0 ? extendedEndTime - endTime : ""
                      }
                      min="1"
                      max="12"
                      placeholder="Enter extra hours (1-12)"
                      onChange={handleLateNightHoursChange}
                      className="w-full p-2 bg-white border border-black rounded-xl focus:ring-0 focus:bg-white focus:border-[#8C63FF]"
                    />
                  </Background>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </Background>
  );
};

const TimeRestrictionCondition = memo(MemoTimeRestrictionCondition);
export default TimeRestrictionCondition;
