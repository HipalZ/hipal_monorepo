import { useSelectedButtonStore } from "@/components/store/useSelectBtn";
import { isElementInView } from "@/components/utils/helper";
import React, { memo, useEffect, useMemo, useRef } from "react";

interface ButtonProps {
  text: string;
  Icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
}

interface Props {
  buttons: ButtonProps[];
}

const SubheaderButtonList: React.FC<Props> = ({ buttons }) => {
  const buttonsContainerRef = useRef<HTMLDivElement | null>(null);
  const buttonRefs: React.RefObject<HTMLButtonElement>[] = buttons.map(() =>
    React.createRef()
  );

  const { setSelectedButton, selectedButton } = useSelectedButtonStore();

  const buttonRefMap = useMemo(() => {
    return buttons.reduce((acc, button, index) => {
      acc[button.text] = buttonRefs[index];
      return acc;
    }, {} as { [key: string]: React.RefObject<HTMLButtonElement> });
  }, [buttons, buttonRefs]);

  useEffect(() => {
    if (
      selectedButton &&
      buttonRefMap[selectedButton] &&
      !isElementInView(buttonRefMap[selectedButton].current)
    ) {
      buttonRefMap[selectedButton].current?.scrollIntoView({
        behavior: "smooth",
        inline: "center",
      });
    }
  }, [selectedButton, buttonRefMap]);

  return (
    <div
      ref={buttonsContainerRef}
      className="flex px-6 py-2 mt-4 space-x-4 overflow-x-scroll whitespace-nowrap hide-scrollbar"
    >
      {buttons.map((button, index) => (
        <button
          key={index.toString()}
          type="button"
          ref={buttonRefs[index]}
          onClick={() => {
            setSelectedButton(button.text);
          }}
          className={`flex items-center space-x-2 on_active_bounce font-medium px-4 py-2 rounded-xl focus:outline-none text-base transition-colors duration-500 
          ${
            selectedButton === button.text
              ? "bg-[#2B354D] text-white scale-105"
              : "bg-white text-[#2B354D]"
          }`}
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
