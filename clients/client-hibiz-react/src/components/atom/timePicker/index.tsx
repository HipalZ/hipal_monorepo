import useTimings from "@/components/store/useTimings";
import { memo } from "react";

const TimePicker = () => {
  const { dayIn, dayOut, setDayIn, setDayOut } = useTimings();

  const handleInTimeChange = (event: any) => {
    setDayIn(event.target.value);
  };
  const handleOutTimeChange = (event: any) => {
    setDayOut(event.target.value);
  };

  return (
    <>
      <div className="flex flex-col mt-2 space-y-4 pb-4">
        <div className="flex flex-col justify-start">
          <label htmlFor="inTime" className="text-sm opacity-50 pb-4">
            Opening timings
          </label>
          <input
            type="time"
            id="inTime"
            value={dayIn}
            onChange={handleInTimeChange}
            className="border rounded-md focus:outline-none focus:ring-0"
          />
        </div>

        <div className="hidden mx-2 md:block"> - </div>

        <div className="flex flex-col justify-start">
          <label htmlFor="outTime" className="text-sm opacity-50 pb-4">
            Close timings
          </label>
          <input
            type="time"
            id="outTime"
            value={dayOut}
            onChange={handleOutTimeChange}
            className="border rounded-md focus:outline-none focus:ring-0"
          />
        </div>
      </div>
    </>
  );
};

export default memo(TimePicker);
