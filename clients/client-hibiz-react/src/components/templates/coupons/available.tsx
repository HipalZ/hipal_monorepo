import { memo, useCallback, useState } from "react";
import Coupon from "./coupon";
import BottomButton from "@/components/atom/bottomButton";
import useCouponsStore, {
  type availability,
} from "@/components/store/useCouponsStore";
import Background from "@/components/atom/feildBackground";
import { IoMdArrowDropdown } from "react-icons/io";
import PopUp from "@/components/atom/popUp";
import { cn } from "@hi/common";
import toast from "react-hot-toast";

const periodArray = [
  { id: 1, name: "allthetime", text: "All the time Till it doesn’t expire" },
  { id: 2, name: "weekdays", text: "Weekdays Only (e.g., Monday to Friday)" },
  {
    id: 3,
    name: "weekends",
    text: "Weekends Only (e.g., Saturday and Sunday)",
  },
  { id: 5, name: "birthdayweek", text: "Birthday Week" },
  { id: 6, name: "birthdaymonth", text: "Birthday Month" },
  { id: 7, name: "custom", text: "Specific Days (e.g., Only on Tuesdays)" },
];

const daysArray = [
  { id: 1, name: "Sunday" },
  { id: 2, name: "Monday" },
  { id: 3, name: "Tuesday" },
  { id: 4, name: "Wednesday" },
  { id: 5, name: "Thursday" },
  { id: 6, name: "Friday" },
  { id: 7, name: "Saturday" },
];

const CustomDayButtons = ({ customDays = [], handleCustomDayToggle }: any) => (
  <div className="flex flex-wrap gap-2 mt-2">
    {daysArray.map((day) => (
      <button
        type="button"
        key={day.id}
        onClick={() => handleCustomDayToggle(day.name.toLowerCase())}
        className={cn(
          "py-2 px-4 border rounded-3xl text-xs",
          customDays.includes(day.name.toLowerCase())
            ? "bg-[#6A31DF50] text-white"
            : "bg-gray-200",
        )}
      >
        {day.name}
      </button>
    ))}
  </div>
);

const convertDecimalToTime = (decimalTime: number) => {
  const hours = Math.floor(decimalTime);
  const minutes = Math.round((decimalTime - hours) * 100);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0",
  )}`;
};

const TimePicker = ({
  startTime,
  endTime,
  extendedEndTime,
  handleTimeChange,
  errorMessage,
}: any) => (
  <div className="flex flex-col justify-center gap-4 lg:flex-row">
    <div className="flex justify-between">
      <label>Start Time:</label>
      <input
        type="time"
        value={convertDecimalToTime(startTime)}
        onChange={(e) => handleTimeChange(e.target.value, "start")}
        className="px-2 py-1 border rounded-xl"
      />
    </div>
    <div className="flex justify-between">
      <label>End Time:</label>
      <input
        type="time"
        value={convertDecimalToTime(endTime)}
        onChange={(e) => handleTimeChange(e.target.value, "end")}
        className="px-2 py-1 border rounded-xl"
      />
    </div>
    {extendedEndTime > 0 && (
      <div className="mt-2">
        <p className="text-sm text-green-600">
          Extended End Time: {convertDecimalToTime(extendedEndTime)}
        </p>
      </div>
    )}
    {errorMessage && (
      <p className="mt-2 text-sm text-red-500">{errorMessage}</p>
    )}
  </div>
);

const MemoAvailable = () => {
  const {
    setSelectedPage,
    openAvailableModal,
    setOpenAvailableModal,
    when,
    setWhen,
    customDays = [],
    setCustomDays,
    startTime,
    endTime,
    setStartTime,
    setEndTime,
    extendedEndTime,
    setExtendedEndTime,
    allowLateNight,
    setAllowLateNight,
  } = useCouponsStore((s) => ({
    setSelectedPage: s.setSelectedPage,
    openAvailableModal: s.openAvailableModal,
    setOpenAvailableModal: s.setOpenAvailableModal,
    when: s.when,
    setWhen: s.setWhen,
    customDays: s.customDays,
    setCustomDays: s.setCustomDays,
    startTime: s.startTime,
    endTime: s.endTime,
    setStartTime: s.setStartTime,
    setEndTime: s.setEndTime,
    extendedEndTime: s.extendedEndTime,
    setExtendedEndTime: s.setExtendedEndTime,
    setAllowLateNight: s.setAllowLateNight,
    allowLateNight: s.allowLateNight,
  }));

  const [errorMessage, setErrorMessage] = useState<string>("");

  const [selectedPeriodText, setSelectedPeriodText] = useState<string>(() => {
    const foundPeriod = periodArray.find((period) => period.name === when);
    return foundPeriod ? foundPeriod.text : "Select Period";
  });

  const handlePeriodSelection = useCallback(
    (periodName: availability, periodText: string) => {
      setWhen(periodName);
      setSelectedPeriodText(periodText);

      setStartTime(0);
      setEndTime(0);
      setExtendedEndTime(0);

      if (periodName === "weekdays") {
        setCustomDays(["monday", "tuesday", "wednesday", "thursday", "friday"]);
      } else if (periodName === "weekends") {
        setCustomDays(["saturday", "sunday"]);
      } else if (periodName === "custom") {
        setCustomDays(["monday"]);
      } else if (periodName !== "custom") {
        setCustomDays([]);
      }
    },
    [setStartTime, setEndTime, setExtendedEndTime],
  );

  const handleTimeChange = useCallback(
    (time: string, type: "start" | "end") => {
      const [hours, minutes] = time.split(":").map(Number);
      console.log(hours, minutes);
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
        } else {
          setErrorMessage("");
          setEndTime(Number(timeInDecimal));
        }
      }
    },
    [startTime, setStartTime, setEndTime],
  );

  const handleCustomDayToggle = useCallback(
    (day: string) => {
      setCustomDays(
        customDays.includes(day)
          ? customDays.filter((d) => d !== day)
          : [...customDays, day],
      );
    },
    [customDays, setCustomDays],
  );

  const openModal = useCallback(() => {
    setOpenAvailableModal(true);
  }, [setOpenAvailableModal]);

  const closeModal = useCallback(() => {
    setOpenAvailableModal(false);
  }, [setOpenAvailableModal]);

  const goNext = useCallback(() => {
    if (when === "custom" && customDays.length === 0) {
      return toast.error("Please select at least one day");
    }
    setSelectedPage("EXPIRED");
  }, [when, customDays]);

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

  return (
    <section className="pb-[6rem] overflow-hidden flex flex-col lg:flex-row gap-6">
      <Coupon />
      <section className="mx-6 mt-[2rem] lg:mt-4 flex-1">
        <h3>Set When is the Coupon Valid</h3>
        <Background>
          <button
            type="button"
            onClick={openModal}
            className="w-full px-4 py-3 border border-black rounded-2xl"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-left truncate opacity-50">
                {selectedPeriodText}
              </h4>
              <IoMdArrowDropdown />
            </div>
          </button>
        </Background>

        {customDays?.length > 0 && (
          <>
            <div className="mt-4">
              <h4>Choose Days</h4>
            </div>
            <Background>
              <CustomDayButtons
                customDays={customDays}
                handleCustomDayToggle={handleCustomDayToggle}
              />
            </Background>
            <div className="mt-4">
              <h4>Select time period</h4>
            </div>
            <Background>
              <TimePicker
                startTime={startTime}
                endTime={endTime}
                extendedEndTime={extendedEndTime}
                handleTimeChange={handleTimeChange}
                errorMessage={errorMessage}
              />
            </Background>

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
      </section>

      {openAvailableModal && (
        <PopUp show={openAvailableModal} onClose={closeModal} width="w-[28rem]">
          <div className="p-4 h-[80dvh] overflow-auto">
            <ul>
              {periodArray.map((period) => (
                <li key={period.id}>
                  <button
                    type="button"
                    onClick={() =>
                      handlePeriodSelection(
                        period.name as availability,
                        period.text,
                      )
                    }
                    className={cn(
                      "py-2 px-4 text-left hover:bg-[#6A31DF50]",
                      when === period.name
                        ? "bg-[#6A31DF50] text-white rounded-xl"
                        : "",
                    )}
                  >
                    {period.text}
                  </button>
                </li>
              ))}
            </ul>
            {customDays?.length > 0 && (
              <CustomDayButtons
                customDays={customDays}
                handleCustomDayToggle={handleCustomDayToggle}
              />
            )}
          </div>
          <BottomButton buttons={[{ text: "save", onClick: closeModal }]} />
        </PopUp>
      )}

      <BottomButton
        buttons={[
          { text: "Back", onClick: () => setSelectedPage("DETAILS") },
          { text: "Next", onClick: goNext },
        ]}
        fixed
      />
    </section>
  );
};

const Available = memo(MemoAvailable);
export default Available;
