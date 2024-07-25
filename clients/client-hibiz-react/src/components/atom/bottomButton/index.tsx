import { memo } from "react";

const MemoBottomButton = (props: {
  text: string;
  onClick?: () => void;
  type?: "button" | "reset" | "submit";
}) => {
  const { text, onClick, type } = props;
  return (
    <button
      className="absolute w-[88%] rounded-full bg-black text-white text-center py-3  bottom-4 left-6 right-6 md:max-w-[26rem]
         md:left-0 md:right-0 md:mx-auto"
      onClick={onClick}
      type={type ?? "button"}
    >
      {text}
    </button>
  );
};

const BottomButton = memo(MemoBottomButton);
export default BottomButton;
