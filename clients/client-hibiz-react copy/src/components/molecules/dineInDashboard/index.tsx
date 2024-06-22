import type React from 'react';
import { memo } from 'react';

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

const DineInDashboard: React.FC<DineInDashboardProps> = memo(({ buttons, handleClick }) => {
  return (
    <div>
      <div className="flex items-center justify-center">
        <p className="mx-6 mt-6 flex h-64 w-full items-center justify-center bg-[#f5f5f5]">Graph</p>
      </div>
      <div className="mx-6 mt-5 grid grid-cols-2 gap-4 pb-12">
        {buttons.map((item, index) => (
          <div
            onClick={() => handleClick(item.text)}
            key={index}
            className={`${item?.class?.background} ${item.class.color} on_active_bounce space-y-6 rounded-xl border border-[#CACACA] p-4`}
          >
            <div className={`on_active_bounce`}>
              <item.Icon className={` ${item.class.font} ${item.class.bg}  rounded-full px-2`} />
            </div>
            <div className={`${item?.class?.text} font-medium`}>{item.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default DineInDashboard;
