import Image from "next/image";
import { memo } from "react";
import Mixed from "@/assets/svg/Mixed.svg";
import { useCart } from "@/components/store/useCart";
import { cn } from "@/components/utils/helpers";

export type FOOD_TYPES = "VEG" | "EGG" | "NON_VEG" | "VEGAN" | "OTHER" | "MIXED";

const FoodType = ({ types }: { types: FOOD_TYPES[] }) => {
  const { showCart } = useCart();
  const classes: Record<
    FOOD_TYPES,
    { border: string; circle: string; text: string }
  > = {
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
    },
  };

  return (
    <div className="flex flex-row my-auto space-x-2 shrink-0">
      {types.map((type, index) => {
        const sanitizedType = type.replace(/[^a-zA-Z]/g, "").toLowerCase();
        const currentType = sanitizedType in classes ? sanitizedType as FOOD_TYPES : "other";

        if (currentType === "mixed") {
          return (
            <div key={index} className={cn("flex flex-row", !showCart ? "-mt-2 -mb-8" : "")}>
              <Image src={Mixed} width={20} height={4} alt="mixed" loading="lazy" />
            </div>
          );
        }

        return (
          <div key={index} className={`flex flex-row w-5 h-5 border-2 rounded-md ${classes[currentType].border}`}>
            <div className={`m-auto rounded-full  w-[0.676rem] h-[0.676rem] ${classes[currentType].circle}`} />
          </div>
        );
      })}
    </div>
  );
};

const MemoFoodType = memo(FoodType);
export default MemoFoodType;
