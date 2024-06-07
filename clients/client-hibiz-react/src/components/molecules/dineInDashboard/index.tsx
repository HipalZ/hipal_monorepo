import type React from "react";
import { memo } from "react";

interface ButtonItem {
  text: string;
  Icon: React.ComponentType<{ className?: string }>;
  class: {
    text: string;
    background?: string;
    color: string;
    font: string;
    bg: string;
  };
}

interface DineInDashboardProps {
  buttons: ButtonItem[];
  handleClick: (text: string) => void;
}

const DineInDashboard: React.FC<DineInDashboardProps> = memo(({
  buttons,
  handleClick,
}) => {
  return (
    <div>
      <div className="flex justify-center items-center">
        <p className="bg-[#f5f5f5] h-64 w-full mx-6 mt-6 flex justify-center items-center">
          Graph
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-5 mx-6 pb-12">
        {buttons.map((item, index) => (
          <div
            onClick={() => handleClick(item.text)}
            key={index}
            className={`${item?.class?.background} ${item.class.color} rounded-xl p-4 border on_active_bounce border-[#CACACA] space-y-6`}
          >
            <div className={`on_active_bounce`}>
              <item.Icon
                className={` ${item.class.font} ${item.class.bg}  px-2 rounded-full`}
              />
            </div>
            <div className={`${item?.class?.text} font-medium`}>
              {item.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default DineInDashboard;
