import { memo, useCallback, useState } from "react";
import { useActiveClass } from "@/components/store/useActiveClass";
import Image from "next/image";
import Alcohol from "@/assets/alcohol.png";
import NonAlcohol from "@/assets/NonAlcohol.png";
import { cn } from "@hi/common";
import { HiX } from "react-icons/hi";
import { RiEqualizerLine } from "react-icons/ri";
import BottomPopUp from "../bottomPopUp";
import { _useAllBusiness } from "@/components/store/useAllBusiness";

export const foodTypeIcons = {
  vegan: (
    <div className="w-4 h-4 p-[0.125rem] border-2 border-[#02614b] rounded-sm">
      <div className="w-[0.5rem] h-[0.5rem] bg-[#02614b] rounded-full" />
    </div>
  ),
  egg: (
    <div className="w-4 h-4 p-[0.125rem] border-2 border-[#D2C903] rounded-sm">
      <div className="w-[0.5rem] h-[0.5rem] bg-[#D2C903] rounded-full" />
    </div>
  ),

  alcohol: (
    <div className="w-5 h-5">
      <Image
        src={Alcohol}
        width={20}
        height={20}
        alt="Alcohol"
        className="w-full h-full"
      />
    </div>
  ),
  nonalcohol: (
    <div className="w-5 h-5">
      <Image
        src={NonAlcohol}
        width={20}
        height={20}
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
  const chipColor = color || "#211915";
  const newColor = `${chipColor}15`;
  return (
    <button
      type="button"
      style={{
        backgroundColor: isActive ? newColor : "#ffffff",
        borderColor: isActive ? chipColor : "",
        color: isActive ? chipColor : "#000000",
      }}
      className={cn(
        "flex h-8 shrink-0 items-center justify-start rounded-xl border px-3 py-1.5 shadow-[0_4px_12px_rgba(39,30,24,0.04)] transition active:scale-[0.98]"
      )}
      onClick={onClick}
    >
      {icon ? (
        <div className="flex items-center justify-center w-4 h-4">{icon}</div>
      ) : (
        <div
          className="w-4 h-4 p-[0.125rem] border-2 rounded-sm"
          style={{ borderColor: chipColor }}
        >
          {!isNone ? (
            <>
              {label.toLowerCase() === "non veg" ? (
                <div
                  style={{
                    borderLeft: "4px solid transparent",
                    borderRight: "4px solid transparent",
                    borderBottom: `8px solid ${chipColor}`,
                  }}
                />
              ) : (
                <div
                  className="w-[0.5rem] h-[0.5rem] rounded-full"
                  style={{ backgroundColor: chipColor }}
                />
              )}
            </>
          ) : null}
        </div>
      )}
      <div
        style={{
          color: isActive ? chipColor : undefined,
          borderColor: isActive ? chipColor : "black",
        }}
        className="ml-1 text-[0.75rem] flex items-center justify-center capitalize"
      >
        {label}
        {isActive && <HiX onClick={onClick} />}
      </div>
    </button>
  );
};

const QuickFilter = () => {
  const outletInfo = _useAllBusiness((s) => s.data?.outletInfo);
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
    [setActiveDishType, isActiveDishType]
  );
  return (
    <div>
      <section className="flex items-center gap-2 overflow-x-auto px-2 text-sm text-nowrap hide-scrollbar">
        <FilterOption
          isActive={isActiveDishType.toLowerCase() === "veg"}
          onClick={() => handleFilter("VEG")}
          color="#178A4A"
          label="Veg"
        />
        <FilterOption
          isActive={isActiveDishType.toLowerCase() === "non_veg"}
          onClick={() => handleFilter("NON_VEG")}
          color="#A2382B"
          label="Non Veg"
        />
        <button
          type="button"
          onClick={openModal}
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-xl border border-[#E2D7CA] bg-white px-3 py-1.5 text-xs font-semibold text-[#211915] shadow-[0_4px_12px_rgba(39,30,24,0.04)] transition active:scale-[0.98]"
        >
          <RiEqualizerLine size={18} />
          Filter All
          {isActiveDishType !== "all" && (
            <HiX
              onClick={(e) => {
                e.stopPropagation();
                handleFilter("all");
              }}
              className="ml-0.5"
            />
          )}
        </button>
      </section>
      {isModalOpen && (
        <BottomPopUp height="25dvh" show={isModalOpen} onClose={closeModal}>
          <div className="pt-4 pb-8 mb-4 text-black bg-[#ffffff] rounded-xl">
            <div className="mb-4 text-xl text-center text-[#000000]">
              Filters
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 font-medium text-nowrap">
              {outletInfo?.vegan && (
                <FilterOption
                  isActive={isActiveDishType.toLowerCase() === "vegan"}
                  onClick={() => handleFilter("VEGAN")}
                  color="#02614b"
                  label="Vegan"
                />
              )}
              {outletInfo?.egg && (
                <FilterOption
                  isActive={isActiveDishType.toLowerCase() === "egg"}
                  onClick={() => handleFilter("EGG")}
                  color="#D2C903"
                  label="Egg"
                />
              )}

              {outletInfo?.alcohol && (
                <FilterOption
                  isActive={isActiveDishType.toLowerCase() === "alcohol"}
                  onClick={() => handleFilter("ALCOHOL")}
                  icon={foodTypeIcons.alcohol}
                  label="Alcohol"
                />
              )}
              {outletInfo?.nonAlcohol && (
                <FilterOption
                  isActive={
                    isActiveDishType
                      ?.replace(/[^a-zA-Z ]/, "")
                      .toLowerCase() === "nonalcohol"
                  }
                  onClick={() => handleFilter("NON_ALCOHOL")}
                  icon={foodTypeIcons.nonalcohol}
                  label="Non Alcohol"
                />
              )}
              <FilterOption
                isActive={isActiveDishType === "all"}
                onClick={() => handleFilter("ALL")}
                color="black"
                label="None"
                isNone
              />
            </div>
          </div>
        </BottomPopUp>
      )}
    </div>
  );
};

const MemoQuickFilter = memo(QuickFilter);
export default MemoQuickFilter;
