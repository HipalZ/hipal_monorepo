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
import TimePicker from "./timePicker";

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
    setCouponEndDate,
    setCouponStartDate,
    setExpiryCoupon,
    setOverAllLimit,
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
    setCouponEndDate: s.setCouponEndDate,
    setCouponStartDate: s.setCouponStartDate,
    setExpiryCoupon: s.setExpiryCoupon,
    setOverAllLimit: s.setOverAllLimit,
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

      if (
        periodName === "allthetime" ||
        periodName === "birthdayweek" ||
        periodName === "birthdaymonth"
      ) {
        setCouponStartDate(null);
        setCouponEndDate(null);
        setExpiryCoupon("No Expiration");
        setOverAllLimit(0);
      }

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
      closeModal();
    },
    [setStartTime, setEndTime, setExtendedEndTime],
  );

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
      handlePeriodSelection("custom", "Specific Days (e.g., Only on Tuesdays)");
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
    setSelectedPage("ELIGIBILITY");
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
      <section className="flex-1">
        <Coupon />
        <center className="mt-8 w-full max-w-[28rem] truncate md:text-lg font-bold text-[#8C63FF] bg-[#8C63FF30] py-2">
          {selectedPeriodText}
        </center>
      </section>
      <section className="flex-1 mx-6 lg:mt-4">
        <h3>Set When is the Coupon Valid</h3>
        <Background>
          <button
            type="button"
            onClick={openModal}
            className="w-full px-4 py-3 border border-black rounded-2xl"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-left truncate">{selectedPeriodText}</h4>
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
          <div className="p-4 h-[60dvh] overflow-auto">
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
          </div>
        </PopUp>
      )}

      <BottomButton
        buttons={[
          { text: "Back", onClick: () => setSelectedPage("EXPIRED") },
          { text: "Next", onClick: goNext },
        ]}
        fixed
      />
    </section>
  );
};

const Available = memo(MemoAvailable);
export default Available;
