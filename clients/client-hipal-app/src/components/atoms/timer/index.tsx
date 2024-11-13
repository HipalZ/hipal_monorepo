import { useState, useEffect } from "react";
import { intervalToDuration } from "date-fns";

interface CountdownTimerProps {
  startTime: number; // Start time in milliseconds
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ startTime }) => {
  // Calculate the end time as 24 hours after the start time
  const endTime = startTime + 24 * 60 * 60 * 1000;

  const [remainingTime, setRemainingTime] = useState(endTime - Date.now());

  useEffect(() => {
    if (remainingTime <= 0) return;

    const intervalId = setInterval(() => {
      const timeLeft = endTime - Date.now();

      if (timeLeft <= 0) {
        setRemainingTime(0);
        clearInterval(intervalId);
      } else {
        setRemainingTime(timeLeft);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [endTime]);

  if (remainingTime <= 0) {
    return (
      <div className="flex flex-col items-center mt-4">
        <div className="text-lg font-semibold text-red-500">Time expired!</div>
      </div>
    );
  }

  // Convert the remaining time into hours, minutes, and seconds
  const duration = intervalToDuration({
    start: 0,
    end: remainingTime,
  });

  return (
    <div className="flex flex-col items-center mt-4 mb-6">
      <div className="text-sm font-medium text-gray-600">Cart expires in:</div>
      <div className="flex items-center justify-center mt-2 space-x-4">
        <div className="flex flex-col items-center">
          <div className="text-3xl font-bold text-primary">
            {String(duration.hours || 0).padStart(2, "0")}
          </div>
          <div className="text-xs text-gray-500">Hours</div>
        </div>
        <div className="text-2xl font-bold text-primary">:</div>
        <div className="flex flex-col items-center">
          <div className="text-3xl font-bold text-primary">
            {String(duration.minutes || 0).padStart(2, "0")}
          </div>
          <div className="text-xs text-gray-500">Minutes</div>
        </div>
        <div className="text-2xl font-bold text-primary">:</div>
        <div className="flex flex-col items-center">
          <div className="text-3xl font-bold text-primary">
            {String(duration.seconds || 0).padStart(2, "0")}
          </div>
          <div className="text-xs text-gray-500">Seconds</div>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
