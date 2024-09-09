import React from "react";

const GameButton = ({ text }: { text: string }) => {
  return (
    <button
      type="button"
      className="bg-[#FFC93C] shine text-black h-[45px] w-full min-w-[160px] rounded-2xl relative z-10 transform transition-transform duration-200 active:translate-y-1 shadow-custom active:shadow-none overflow-hidden"
      style={{
        boxShadow: "0 8px #B17E21",
      }}
    >
      {text}
    </button>
  );
};

export default GameButton;
