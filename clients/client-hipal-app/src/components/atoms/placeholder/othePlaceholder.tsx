import { memo } from "react";
import { LuImageOff } from "react-icons/lu";

function MemoPlaceholderImg({ className }: { className?: string }) {
  return (
    <div className={`${className || ""} flex rounded-lg`}>
      <LuImageOff className="w-12 h-12 m-auto text-2xl opacity-50 text-base-content" />
    </div>
  );
}

const OtherPlaceholderImg = memo(MemoPlaceholderImg);
export default OtherPlaceholderImg;
