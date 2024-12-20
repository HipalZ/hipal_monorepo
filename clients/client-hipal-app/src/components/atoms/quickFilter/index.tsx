import { memo, useCallback, useState } from "react";
import { useActiveClass } from "@/components/store/useActiveClass";
import QuickFilterPopup from "../quickFilterPopup";
import Image from "next/image";
import Alcohol from "@/assets/alcohol.png";
import NonAlcohol from "@/assets/NonAlcohol.png";
import { cn } from "@hi/common";
import { HiX } from "react-icons/hi";
import { RiEqualizerLine } from "react-icons/ri";

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
    <div className="flex items-center gap-1">
      <RiEqualizerLine size={20} />
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
}: {
  isActive: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  color?: string;
  label: string;
  isNone?: boolean;
}) => {
  const newColor = `${color}15`;
  return (
    <button
      type="button"
      style={{
        backgroundColor: isActive ? newColor : "#ffffff",
        borderColor: isActive ? color : "",
        color: isActive ? color : "#000000",
      }}
      className={cn(
        "flex justify-start items-center px-2 rounded-md py-1 border",
      )}
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
      <div
        style={{
          color: isActive ? color : undefined,
          borderColor: isActive ? color : "black",
        }}
        className="ml-1 text-[0.75rem] flex items-center justify-center"
      >
        {label}
        {isActive && <HiX />}
      </div>
    </button>
  );
};

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

  console.log(isActiveDishType);
  const activeIcon = (
    <div className="flex items-center">
      {["veg", "nonveg", "non_veg", "egg"].includes(
        isActiveDishType?.replace(/[^a-zA-Z ]/g, "").toLowerCase(),
      ) ? (
        <div className="flex items-center">
          <RiEqualizerLine size={20} />
          <span className="ml-1">Filter</span>
        </div>
      ) : (
        <>
          {foodTypeIcons[
            isActiveDishType
              ?.replace(/[^a-zA-Z ]/g, "")
              .toLowerCase() as keyof typeof foodTypeIcons
          ] || <RiEqualizerLine size={20} />}
          <span className="ml-1">
            {isActiveDishType.charAt(0) + isActiveDishType.slice(1)}
          </span>
        </>
      )}
      {isActiveDishType !== "all" && (
        <HiX onClick={() => handleFilter("all")} className="ml-1" />
      )}
    </div>
  );

  return (
    <div>
      <section className="flex px-2 space-x-2 text-sm justify-evenly text-nowrap">
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
        <FilterOption
          isActive={isActiveDishType.toLowerCase() === "egg"}
          onClick={() => handleFilter("EGG")}
          color="#D2C903"
          label="Egg"
        />
        <button
          type="button"
          onClick={openModal}
          className="px-2 py-1 ml-2 text-xs font-semibold text-black border border-gray-200 rounded-md"
        >
          {activeIcon}
        </button>
      </section>
      {isModalOpen && (
        <QuickFilterPopup show={isModalOpen} onClose={closeModal}>
          <div className="pt-4 pb-8 mb-4 text-black bg-[#ffffff] rounded-xl">
            <div className="mb-4 text-xl text-center text-[#000000]">
              Filters
            </div>
            <div className="mx-[1rem] font-medium space-y-4">
              <FilterOption
                isActive={isActiveDishType.toLowerCase() === "vegan"}
                onClick={() => handleFilter("VEGAN")}
                color="#02614b"
                label="Vegan"
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
