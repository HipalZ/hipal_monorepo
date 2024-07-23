import { memo } from "react";
import { TfiPaintBucket } from "react-icons/tfi";

interface IProps {
  element: string;
  colorWheel: boolean;
  setColorWheel: (value: boolean) => void;
  onColorChange: (element: string, color: string) => void;
}

const MemoStylingsIcons = ({
  element,
  colorWheel,
  setColorWheel,
  onColorChange,
}: IProps) => {
  return (
    <aside className="flex mt-4 space-x-4">
      <article
        onClick={() => setColorWheel(!colorWheel)}
        className="px-3 py-2 border border-black on_active_bounce rounded-2xl border-1"
      >
        <span>
          <TfiPaintBucket size={16} />
        </span>
      </article>
      {colorWheel ? (
        <input
          type="color"
          onChange={(e) => onColorChange(element, e.target.value)}
        />
      ) : null}
    </aside>
  );
};
const StylingsIcons = memo(MemoStylingsIcons);
export default StylingsIcons;
