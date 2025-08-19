import { useState, useEffect } from "react";

const getScreenSize = (width: number): string => {
  if (width < 640) {
    return "xs";
  }
  if (width < 768) {
    return "sm";
  }
  if (width < 1024) {
    return "md";
  }
  if (width < 1280) {
    return "lg";
  }
  if (width < 1536) {
    return "xl";
  }
  return "2xl";
};

export const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState(
    getScreenSize(window.innerWidth),
  );

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const newSize = getScreenSize(window.innerWidth);
        if (newSize !== screenSize) {
          setScreenSize(newSize);
        }
      }, 150);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, [screenSize]);

  return screenSize;
};
