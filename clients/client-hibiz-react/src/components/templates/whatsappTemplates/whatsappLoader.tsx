import { memo, useEffect, useRef } from "react";
import HiLogo from "@/assets/login/hand.png";

const MemoizedWhatsAppLoader: React.FC = () => {
  const progressRef = useRef(0); // Track progress without causing re-renders
  const timerRef = useRef<NodeJS.Timer | null>(null);
  const circleRef = useRef<SVGCircleElement | null>(null);

  useEffect(() => {
    const radius = 50;
    const strokeWidth = 4;
    const normalizedRadius = radius - strokeWidth * 2;
    const circumference = normalizedRadius * 2 * Math.PI;

    // Initialize the circle's strokeDasharray
    if (circleRef.current) {
      circleRef.current.style.strokeDasharray = `${circumference} ${circumference}`;
    }

    // Set up the interval to update progress
    timerRef.current = setInterval(() => {
      progressRef.current =
        progressRef.current >= 100 ? 0 : progressRef.current + 10;
      const offset =
        circumference - (progressRef.current / 100) * circumference;

      if (circleRef.current) {
        circleRef.current.style.strokeDashoffset = offset.toString();
      }
    }, 750);

    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="relative">
        <svg
          height={100} // radius * 2
          width={100} // radius * 2
          className="transform -rotate-90"
        >
          <title>Loader</title>
          <circle
            ref={circleRef} // Use ref to directly manipulate the circle
            stroke="#25D366"
            fill="transparent"
            strokeWidth={4}
            r={50 - 4 * 2} // normalizedRadius
            cx={50} // radius
            cy={50} // radius
          />
        </svg>
        <img
          src={HiLogo}
          alt="HiLogo"
          className="absolute w-3/4 transform scale-90 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 h-3/4"
        />
      </div>
    </div>
  );
};

const WhatsAppLoader = memo(MemoizedWhatsAppLoader);
export default WhatsAppLoader;
