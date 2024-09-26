import React, { memo, useCallback, useState } from "react";
import { useActiveClass } from "@/components/store/useActiveClass";
import QuickFilterPopup from "../quickFilterPopup";
import Image from "next/image";
import Mixed from "@/assets/svg/Mixed.svg";
import Alcohol from "@/assets/alcohol.png";
import NonAlcohol from "@/assets/NonAlcohol.png";
import { FaCaretDown } from "react-icons/fa";

export const foodTypeIcons = {
  vegan: (
    <div className="w-4 h-4 p-[0.125rem] border-2 border-[#02614b]">
      <div className="w-[0.5rem] h-[0.5rem] bg-[#02614b] rounded-full" />
    </div>
  ),
  egg: (
    <div className="w-4 h-4 p-[0.125rem] border-2 border-[#D2C903]">
      <div className="w-[0.5rem] h-[0.5rem] bg-[#D2C903] rounded-full" />
    </div>
  ),
  mixed: (
    <div className="w-4 h-4">
      <Image
        src={Mixed}
        width={16}
        height={16}
        alt="Mixed"
        className="w-full h-full"
      />
    </div>
  ),
  alcohol: (
    <div className="w-4 h-4">
      <Image
        src={Alcohol}
        width={16}
        height={16}
        alt="Alcohol"
        className="w-full h-full"
      />
    </div>
  ),
  nonalcohol: (
    <div className="w-4 h-4">
      <Image
        src={NonAlcohol}
        width={16}
        height={16}
        alt="Non Alcohol"
        className="w-full h-full"
      />
    </div>
  ),
  all: (
    <div className="flex items-center">
      <FaCaretDown size={20} />
      Filter
    </div>
  ),
};

const FilterOption = ({
  isActive,
  onClick,
  icon,
  color,
  label,
  isNone = false,
}) => (
  <div
    className={`${
      isActive ? "bg-primary text-base-100" : ""
    } flex justify-center items-center px-2 rounded-full py-1 border border-primary `}
    onClick={onClick}
  >
    {icon ? (
      <div className="flex items-center justify-center w-4 h-4">{icon}</div>
    ) : (
      <div
        className="w-4 h-4 p-[0.125rem] border-2"
        style={{ borderColor: color }}
      >
        {!isNone ? (
          <div
            className="w-[0.5rem] h-[0.5rem] rounded-full"
            style={{ backgroundColor: color }}
          />
        ) : (
          <></>
        )}
      </div>
    )}
    <div className="ml-1 text-[0.75rem]">{label}</div>
  </div>
);

const QuickFilter = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { setActiveDishType, isActiveDishType } = useActiveClass();

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleFilter = useCallback(
    (str: string) => {
      if (
        isActiveDishType?.replace(/[^a-zA-Z ]/, "").toLowerCase() ===
        str?.replace(/[^a-zA-Z ]/, "").toLowerCase()
      ) {
        setActiveDishType("all");
        setIsModalOpen(false);
        return;
      }
      setActiveDishType(str);
      setIsModalOpen(false);
    },
    [setActiveDishType, isActiveDishType],
  );

  const activeIcon = foodTypeIcons[
    isActiveDishType?.replace(/[^a-zA-Z ]/, "").toLowerCase()
  ] || (
    <div className="flex items-center">
      <FaCaretDown size={20} /> Filter
    </div>
  );

  return (
    <div>
      <section className="flex space-x-2 text-xs justify-evenly text-nowrap">
        <FilterOption
          isActive={isActiveDishType.toLowerCase() === "veg"}
          onClick={() => handleFilter("VEG")}
          color="#55CB1E"
          label="Veg"
        />
        <FilterOption
          isActive={isActiveDishType.toLowerCase() === "non_veg"}
          onClick={() => handleFilter("NON_VEG")}
          color="#FF6363"
          label="Non Veg"
        />
        <div
          onClick={openModal}
          className="px-2 py-1 ml-2 text-xs font-semibold border rounded-full text-primary border-primary"
        >
          {activeIcon}
        </div>
      </section>
      {isModalOpen && (
        <QuickFilterPopup show={isModalOpen} onClose={closeModal}>
          <div className="pt-4 pb-8 w-[7rem] text-base-content bg-base-100 rounded-xl mb-4">
            <div className="mb-4 text-xl text-center text-primary">Filters</div>
            <div className="mx-[1rem] font-medium space-y-4">
              <FilterOption
                isActive={isActiveDishType.toLowerCase() === "vegan"}
                onClick={() => handleFilter("VEGAN")}
                color="#02614b"
                label="Vegan"
              />
              <FilterOption
                isActive={isActiveDishType.toLowerCase() === "egg"}
                onClick={() => handleFilter("EGG")}
                color="#D2C903"
                label="Egg"
              />
              <FilterOption
                isActive={isActiveDishType.toLowerCase() === "alcohol"}
                onClick={() => handleFilter("ALCOHOL")}
                icon={foodTypeIcons.alcohol}
                label="Alcohol"
              />
              <FilterOption
                isActive={
                  isActiveDishType?.replace(/[^a-zA-Z ]/, "").toLowerCase() ===
                  "nonalcohol"
                }
                onClick={() => handleFilter("NON_ALCOHOL")}
                icon={foodTypeIcons.nonalcohol}
                label="Non Alcohol"
              />
              <FilterOption
                isActive={isActiveDishType.toLowerCase() === "mixed"}
                onClick={() => handleFilter("MIXED")}
                icon={foodTypeIcons.mixed}
                label="Mixed"
              />
              <FilterOption
                isActive={isActiveDishType === "all"}
                onClick={() => handleFilter("ALL")}
                color="transparent"
                label="None"
                isNone
              />
            </div>
          </div>
        </QuickFilterPopup>
      )}
    </div>
  );
};

const MemoQuickFilter = memo(QuickFilter);
export default MemoQuickFilter;
