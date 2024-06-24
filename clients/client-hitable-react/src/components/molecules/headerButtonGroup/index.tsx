import {memo} from "react";
import { RiCalendarCheckFill } from "react-icons/ri";
import { MdOutlineCategory, MdOutlineFeed } from "react-icons/md";

const headerButtonData = [
    {
        text: "Status",
        Icon: RiCalendarCheckFill,
    },
    {
        text: "POS",
        Icon: MdOutlineCategory,
    },
    {
        text: "Settle",
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
    const handleOnClick = (text:string) => {
        if (onButtonClick) {
            onButtonClick(text);
        }
    };

    const filteredButtons = headerButtonData.filter((button) => {
      if (button.text === "POS") {
        return showPos;
      }
      if ((button.text === "Status" || button.text === "Settle") && status === "empty") {
        return false; 
      }
      return true;
    });

    const shouldCenterPos = filteredButtons.length === 1 && filteredButtons[0].text === "POS";

    return (
        <div className={`flex items-center ${shouldCenterPos ? 'justify-center' : 'justify-between'} w-full p-4 mt-4 rounded-full bg-base-100`}>
            {filteredButtons.map((ele, i) => (
                <div
                    key={`key${i}`}
                    onClick={() => handleOnClick(ele.text)}
                    className="flex items-center justify-center px-2 cursor-pointer"
                >
                    <ele.Icon
                        className={`text-2xl ${
                            activeButton.toLowerCase() === ele.text.toLowerCase()
                                ? "text-primary"
                                : "text-base-content/60"
                        }`}
                    />
                    <p
                        className={`text-[0.875rem] ml-2 leading-[1rem] ${
                            activeButton.toLowerCase() === ele.text.toLowerCase()
                                ? "text-primary font-[500]"
                                : "text-base-content/60 font-normal"
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
