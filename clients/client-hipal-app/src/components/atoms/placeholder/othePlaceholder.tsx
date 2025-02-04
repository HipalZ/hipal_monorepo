import { memo } from "react";
import { LuImageOff } from "react-icons/lu";

function MemoPlaceholderImg({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`${className || ""} flex rounded-lg`}>
      <LuImageOff className="w-12 h-12 m-auto text-2xl opacity-50 text-base-content" />
    </div>
  );
}

const OtherPlaceholderImg = memo(MemoPlaceholderImg);
export default OtherPlaceholderImg;
