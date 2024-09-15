import { cn } from "@/components/utils/helpers";
import React from "react";

const GameButton = ({
  text,
  hideShine,
}: { text: string; hideShine?: boolean }) => {
  return (
    <button
      type="button"
      className={cn(
        text?.toLowerCase() === "use couponz" ? "shine2" : "",
        hideShine ? "" : "shine",
        "bg-[#FFC93C] text-black h-[45px] w-full min-w-[160px] rounded-2xl relative z-10 transform transition-transform duration-200 active:translate-y-1 shadow-custom active:shadow-none overflow-hidden",
      )}
      style={{
        boxShadow: "0 8px #B17E21",
      }}
    >
      {text}
    </button>
  );
};

export default GameButton;
