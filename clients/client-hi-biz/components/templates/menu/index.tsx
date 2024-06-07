import Header from "@/components/molecules/header";
import React, { memo, useState } from "react";
import { BsChevronLeft } from "react-icons/bs";
import Hi from "@/assets/svg/hi.svg";
import { useOwnerLogin } from "@/components/store/useOwnerLogin";
import { useSelectedIcon } from "@/components/store/useSelectedIcon";

const menuOptions = [
  {
    text: "Dine In",
  },
  {
    text: "Take Away",
  },
  {
    text: "Delivery",
  },
];

function Menu() {
  const [activeIndex, setActiveIndex] = useState(0);
  const setSelectedIcon = useSelectedIcon((s) => s.setSelectedIcon);
  const user = useOwnerLogin(s=>s.user)

  function handleOptionSelect(text: string, index: number) {
    setActiveIndex(index);
    setSelectedIcon(text);
  }
  return (
    <>
      <div className="bg-[#f5f5f5] sticky z-20 top-0">
        <Header title="Menu" onBack={()=>setSelectedIcon("")} leftIcon={<BsChevronLeft />} centerImage={Hi} rightImage={Hi} isIconBusinessShow={user.role !== "RESTAURANT_MANAGER"} />
        <div className="flex justify-between items-center mt-6 px-6 pb-4 border-b border-[#cacaca]">
          <div className="flex text-2xl">
            <span className="ml-2">Menu</span>
          </div>
          <button type="button" className="bg-[#2B354D] text-sm px-4 py-2 rounded-xl text-white">
            + Add Menu
          </button>
        </div>
      </div>
      <div className="mx-6 mt-5">
        {menuOptions.map((item, index) => {
          return (
            <h1
              onKeyDown={() => handleOptionSelect(item.text, index)}
              onClick={() => handleOptionSelect(item.text, index)}
              key={index.toString()}
              className={`${index === activeIndex
                ? "bg-[#2B354D] text-white"
                : "border border-1 text-gray-200"
                } cursor-pointer my-4 py-5 px-4  text-xl rounded-lg`}
            >
              {item.text}
            </h1>
          );
        })}
      </div>
    </>
  );
}

export default memo(Menu);
