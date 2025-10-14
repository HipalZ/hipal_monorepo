// useHorizontalScroll.ts
import { useRef, useEffect } from "react";

export function useHorizontalScroll<T extends HTMLElement>() {
  const elRef = useRef<T>(null);

  useEffect(() => {
    const el = elRef.current;
    if (el) {
      const onWheel = (e: WheelEvent) => {
        const mostlyVertical = Math.abs(e.deltaY) > Math.abs(e.deltaX);
        if (!e.shiftKey && mostlyVertical) {
          e.preventDefault();
          el.scrollLeft += e.deltaY;
        }
      };

      el.addEventListener("wheel", onWheel, { passive: false });
      return () => el.removeEventListener("wheel", onWheel);
    }
  }, []); // Run effect once on mount

  return elRef;
}
