import { cn } from "@/components/utils/helpers";
import React from "react";

const GameButton = ({
  text,
  hideShine,
}: { text: string; hideShine?: boolean }) => {
  return (
    <article className="h-16 overflow-hidden">
      <button
        type="button"
        className={cn(
          text?.toLowerCase() === "use couponz" ? "" : "",
          hideShine ? "" : "new-btn-shine",
          "bg-[#FFC93C] text-black text-sm h-[45px] w-full min-w-[160px] rounded-2xl relative z-10 transform transition-transform duration-200 active:translate-y-1 shadow-custom active:shadow-none overflow-hidden",
        )}
        style={{
          boxShadow: "0 8px #B17E21",
        }}
      >
        {text}
      </button>
    </article>
  );
};

export default GameButton;
