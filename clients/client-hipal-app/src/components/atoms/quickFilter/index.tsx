"use client";
import type React from "react";

import { memo, useCallback, useRef, useEffect } from "react";
import { useActiveClass } from "@/components/store/useActiveClass";
import Image from "next/image";
import veg from "@/assets/veg.png";
import nonVeg from "@/assets/nonveg.png";
import egg from "@/assets/egg.png";
import vegan from "@/assets/vegan.png";
import Alcohol from "@/assets/alcohol.png";
import NonAlcohol from "@/assets/NonAlcohol.png";
import { cn } from "@hi/common";
import { HiX } from "react-icons/hi";
import { RiEqualizerLine } from "react-icons/ri";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import type { Splide as SplideInstance } from "@splidejs/splide";

// Import Splide CSS
import "@splidejs/splide/dist/css/splide.min.css";
import { _useAllBusiness } from "@/components/store/useAllBusiness";

export const foodTypeIcons = {
  veg: (
    <div>
      <Image
        src={veg || "/placeholder.svg"}
        alt="vegan"
        width={24}
        height={24}
        className="w-full h-full"
      />
    </div>
  ),
  nonVeg: (
    <div>
      <Image
        src={nonVeg || "/placeholder.svg"}
        width={24}
        height={24}
        alt="vegan"
        className="w-full h-full"
      />
    </div>
  ),
  vegan: (
    <div>
      <Image
        src={vegan || "/placeholder.svg"}
        width={24}
        height={24}
        alt="vegan"
        className="w-full h-full"
      />
    </div>
  ),
  egg: (
    <div>
      <Image
        src={egg || "/placeholder.svg"}
        width={24}
        height={24}
        alt="egg"
        className="w-full h-full"
      />
    </div>
  ),
  alcohol: (
    <div>
      <Image
        src={Alcohol || "/placeholder.svg"}
        width={24}
        height={24}
        alt="Alcohol"
        className="w-full h-full"
      />
    </div>
  ),
  nonalcohol: (
    <div>
      <Image
        src={NonAlcohol || "/placeholder.svg"}
        width={24}
        height={24}
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
  onClear,
  icon,
  color,
  label,
  isNone = false,
}: {
  isActive: boolean;
  onClick: () => void;
  onClear?: (e: React.MouseEvent) => void;
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
      className={cn("flex px-2 rounded-md py-0.5 border w-full h-[2.25rem]")}
      onClick={onClick}
    >
      <div className="flex items-center justify-center">{icon}</div>
      <div
        style={{
          color: isActive ? color : undefined,
          borderColor: isActive ? color : "black",
        }}
        className="ml-1 text-[0.7rem] flex items-center justify-center"
      >
        {label}
        {isActive && (
          <HiX
            className="ml-1 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onClear?.(e);
            }}
          />
        )}
      </div>
    </button>
  );
};

const QuickFilter = () => {
  const { setActiveDishType, isActiveDishType } = useActiveClass();
  const splideRef = useRef<SplideInstance>(null);
  const outletInfo = _useAllBusiness((s) => s.data?.outletInfo);

  const handleFilter = useCallback(
    (str: string) => {
      if (
        isActiveDishType?.replace(/[^a-zA-Z ]/, "").toLowerCase() ===
        str?.replace(/[^a-zA-Z ]/, "").toLowerCase()
      ) {
        setActiveDishType("all");
        if (splideRef.current) {
          splideRef.current.go(0);
        }
        return;
      }
      setActiveDishType(str);
    },
    [setActiveDishType, isActiveDishType],
  );

  const handleClearFilter = useCallback(
    (e: React.MouseEvent) => {
      setActiveDishType("all");
      // Reset to original position
      if (splideRef.current) {
        splideRef.current.go(0);
      }
    },
    [setActiveDishType],
  );

  // Smooth scroll to active filter without forcing position
  useEffect(() => {
    const index = filters.findIndex(
      (filter) => filter.key.toLowerCase() === isActiveDishType.toLowerCase(),
    );

    if (index !== -1 && splideRef.current) {
      // Use go with smooth transition but don't force position
      splideRef.current.go(index - 1);
    }
  }, [isActiveDishType]);

  const filters = [
    { label: "Veg", key: "veg", color: "#55CB1E", icon: foodTypeIcons.veg },
    {
      label: "Non-Veg",
      key: "non_veg",
      color: "#FF6363",
      icon: foodTypeIcons.nonVeg,
    },
    { label: "Egg", key: "egg", color: "#D2C903", icon: foodTypeIcons.egg },
    {
      label: "Vegan",
      key: "vegan",
      color: "#02614b",
      icon: foodTypeIcons.vegan,
    },
    {
      label: "Alcohol",
      key: "alcohol",
      icon: foodTypeIcons.alcohol,
      color: "#AA336A",
    },
    {
      label: "Non Alcohol",
      key: "nonalcohol",
      icon: foodTypeIcons.nonalcohol,
      color: "#02614b",
    },
  ];

  return (
    <div className="relative w-full">
      <Splide
        ref={splideRef}
        options={{
          type: "slide",
          pagination: false,
          arrows: false,
          gap: "0.5rem",
          autoWidth: true,
          drag: true,
          snap: false,
          trimSpace: false,
          flickPower: 20,
          flickMaxPages: 3,
          speed: 400,
          easing: "cubic-bezier(0.25, 1, 0.5, 1)",
          waitForTransition: false,
          dragMinThreshold: 5,
          rewind: false,
          rewindByDrag: false,
          padding: { right: "1rem" },
          height: "auto",
          breakpoints: {
            640: {
              padding: { right: "2rem" },
            },
          },
        }}
        className="px-2 py-1 w-full"
      >
        {filters
          .filter(({ key }) => {
            if (key === "veg") return outletInfo.veg;
            if (key === "non_veg") return outletInfo.nonVeg;
            if (key === "egg") return outletInfo.egg;
            if (key === "vegan") return outletInfo.vegan;
            if (key === "alcohol") return outletInfo.alcohol;
            if (key === "nonalcohol") return outletInfo.nonAlcohol;
            return true;
          })
          .map(({ label, key, color, icon }) => (
            <SplideSlide key={key} className="w-auto">
              <FilterOption
                isActive={isActiveDishType.toLowerCase() === key.toLowerCase()}
                onClick={() => {
                  handleFilter(key.toUpperCase());
                }}
                onClear={handleClearFilter}
                color={color}
                label={label}
                icon={icon}
              />
            </SplideSlide>
          ))}
      </Splide>
    </div>
  );
};

const MemoQuickFilter = memo(QuickFilter);
export default MemoQuickFilter;
