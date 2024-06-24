import { useSelectedButtonStore } from '@/components/store/useSelectBtn';
import { isElementInView } from '@/components/utils/helper';
import React, { memo, useEffect, useMemo, useRef } from 'react';

interface ButtonProps {
  text: string;
  Icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
}

interface Props {
  buttons: ButtonProps[];
}

const SubheaderButtonList: React.FC<Props> = ({ buttons }) => {
  const buttonsContainerRef = useRef<HTMLDivElement | null>(null);
  const buttonRefs: React.RefObject<HTMLButtonElement>[] = buttons.map(() => React.createRef());

  const { setSelectedButton, selectedButton } = useSelectedButtonStore();

  const buttonRefMap = useMemo(() => {
    return buttons.reduce(
      (acc, button, index) => {
        acc[button.text] = buttonRefs[index];
        return acc;
      },
      {} as { [key: string]: React.RefObject<HTMLButtonElement> },
    );
  }, [buttons, buttonRefs]);

  useEffect(() => {
    if (selectedButton && buttonRefMap[selectedButton] && !isElementInView(buttonRefMap[selectedButton].current)) {
      buttonRefMap[selectedButton].current?.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
      });
    }
  }, [selectedButton, buttonRefMap]);

  return (
    <div ref={buttonsContainerRef} className="hide-scrollbar mt-4 flex space-x-4 overflow-x-scroll whitespace-nowrap px-6 py-2">
      {buttons.map((button, index) => (
        <button
          key={index.toString()}
          type="button"
          ref={buttonRefs[index]}
          onClick={() => {
            setSelectedButton(button.text);
          }}
          className={`on_active_bounce flex items-center space-x-2 rounded-xl px-4 py-2 text-base font-medium transition-colors duration-500 focus:outline-none 
          ${selectedButton === button.text ? 'scale-105 bg-[#2B354D] text-white' : 'bg-white text-[#2B354D]'}`}
        >
          <span>
            <button.Icon />
          </span>
          <span>{button.text}</span>
        </button>
      ))}
    </div>
  );
};

export default memo(SubheaderButtonList);
