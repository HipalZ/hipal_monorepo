import { memo } from "react";

export const convertDecimalToTime = (decimalTime: number) => {
  const hours = Math.floor(decimalTime);
  const minutes = Math.round((decimalTime - hours) * 100);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0",
  )}`;
};

const MemoTimePicker = ({
  startTime,
  endTime,
  extendedEndTime,
  handleTimeChange,
  errorMessage,
}: any) => (
  <div className="flex flex-col justify-center gap-4 lg:flex-row lg:justify-evenly">
    <div className="flex items-center justify-between gap-4">
      <label>Start Time:</label>
      <input
        type="time"
        value={convertDecimalToTime(startTime)}
        onChange={(e) => handleTimeChange(e.target.value, "start")}
        className="px-2 py-1 border rounded-xl"
      />
    </div>
    <div className="flex items-center justify-between gap-4">
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

const TimePicker = memo(MemoTimePicker);

export default TimePicker;
