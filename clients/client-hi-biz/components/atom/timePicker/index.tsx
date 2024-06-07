// import useAttendanceStore from "@/components/store/useUpdateData";
import useTimings from '@/components/store/useTimings';
import { memo } from 'react';

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
      <div className="mt-2 flex flex-col space-y-4 pb-4">
        <div className="flex flex-col justify-start">
          <label htmlFor="inTime" className="pb-4 text-sm opacity-50">
            Opening timings
          </label>
          <input type="time" id="inTime" value={dayIn} onChange={handleInTimeChange} className="rounded-md border focus:outline-none focus:ring-0" />
        </div>

        <div className="mx-2 hidden md:block"> - </div>

        <div className="flex flex-col justify-start">
          <label htmlFor="outTime" className="pb-4 text-sm opacity-50">
            Close timings
          </label>
          <input
            type="time"
            id="outTime"
            value={dayOut}
            onChange={handleOutTimeChange}
            className="rounded-md border focus:outline-none focus:ring-0"
          />
        </div>
      </div>
    </>
  );
};

export default memo(TimePicker);
