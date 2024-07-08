import Image from "next/image";
import { memo, useEffect, useState } from "react";
import Mixed from "@/assets/svg/Mixed.svg";
import { useCart } from "@/components/store/useCart";
import { cn } from "@/components/utils/helpers";

export type FOOD_TYPES = "veg" | "nonveg" | "vegan" | "egg" | "other" | "mixed";

const FoodType = ({ type }: { type: FOOD_TYPES }) => {
  const [currentType, setCurrentType] = useState<FOOD_TYPES>("other");
  const {showCart} = useCart();
  const classes: Record<FOOD_TYPES, { border: string; circle: string; text: string }> = {
    veg: {
      border: "border-green-500",
      circle: "bg-green-500",
      text: "text-green-500",
    },
    egg: {
      border: "border-[#D2C903]",
      circle: "bg-[#D2C903]",
      text: "text-[#D2C903]",
    },
    nonveg: {
      border: "border-red-500",
      circle: "bg-red-500",
      text: "text-red-500",
    },
    vegan: {
      border: "border-[#02614b]",
      circle: "bg-[#02614b]",
      text: "text-[#02614b]",
    },
    other: {
      border: "border-gray-500",
      circle: "bg-gray-500",
      text: "text-gray-500",
    },
    mixed: {
      border: "",
      circle: "",
      text: "",
    }
  };

  useEffect(() => {
    if (type) {
      const sanitizedType = type.replace(/[^a-zA-Z]/g, "").toLowerCase();
      if (sanitizedType in classes) {
        setCurrentType(sanitizedType as FOOD_TYPES);
      }
    }
  }, [type]);

  if (type.toLowerCase() === "mixed") {
    return (
      <div className={cn("flex flex-row",!showCart ? "-mt-2 -mb-8" : '')}>
        <Image src={Mixed} width={20} height={4} alt="mixed" loading="lazy"/>
      </div>
    );
  }

  return (
    <div className="flex flex-row my-auto space-x-2 shrink-0">
      <div className={"flex flex-row w-5 h-5 border-2 rounded-md " + classes[currentType].border}>
        <div
          className={
            "p-1 m-auto rounded-full  w-[0.676rem] h-[0.676rem] " + classes[currentType].circle
          }
        ></div>
      </div>
    </div>
  );
}

const MemoFoodType = memo(FoodType);
export default MemoFoodType;
