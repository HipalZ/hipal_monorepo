import { memo } from 'react';
import { MdOutlineCategory, MdOutlineFeed } from 'react-icons/md';
import { RiCalendarCheckFill } from 'react-icons/ri';

const headerButtonData = [
  {
    text: 'Status',
    Icon: RiCalendarCheckFill,
  },
  {
    text: 'POS',
    Icon: MdOutlineCategory,
  },
  {
    text: 'Settle',
    Icon: MdOutlineFeed,
  },
];

function HeaderButtonGroup({
  activeButton,
  onButtonClick,
  showPos,
  status,
}: {
  activeButton: string;
  onButtonClick: (str: string) => void;
  showPos: boolean;
  status?: string;
}) {
  const handleOnClick = (text) => {
    if (onButtonClick) {
      onButtonClick(text);
    }
  };

  const filteredButtons = headerButtonData.filter((button) => {
    if (button.text === 'POS') {
      return showPos;
    }
    if ((button.text === 'Status' || button.text === 'Settle') && status === 'empty') {
      return false;
    }
    return true;
  });

  const shouldCenterPos = filteredButtons.length === 1 && filteredButtons[0].text === 'POS';

  return (
    <div className={`flex items-center ${shouldCenterPos ? 'justify-center' : 'justify-between'} bg-base-100 mt-4 w-full rounded-full p-4`}>
      {filteredButtons.map((ele, i) => (
        <div key={`key${i}`} onClick={() => handleOnClick(ele.text)} className="flex cursor-pointer items-center justify-center px-2">
          <ele.Icon className={`text-2xl ${activeButton.toLowerCase() === ele.text.toLowerCase() ? 'text-primary' : 'text-base-content/60'}`} />
          <p
            className={`ml-2 text-[0.875rem] leading-[1rem] ${
              activeButton.toLowerCase() === ele.text.toLowerCase() ? 'text-primary font-[500]' : 'text-base-content/60 font-normal'
            }`}
          >
            {ele.text}
          </p>
        </div>
      ))}
    </div>
  );
}

export default memo(HeaderButtonGroup);
