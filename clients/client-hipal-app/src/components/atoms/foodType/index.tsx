import Image from "next/image";
import { memo } from "react";
import Mixed from "@/assets/svg/Mixed.svg";
import Alcohol from "@/assets/alcohol.png";
import NonAlcohol from "@/assets/NonAlcohol.png";
import { useCart } from "@/components/store/useCart";
import { cn } from "@/components/utils/helpers";

export type FOOD_TYPES =
  | "VEG"
  | "EGG"
  | "NON_VEG"
  | "VEGAN"
  | "OTHER"
  | "MIXED"
  | "ALCOHOL"
  | "NON_ALCOHOL";

const FoodType = ({ types }: { types: FOOD_TYPES[] }) => {
  const { showCart } = useCart();

  const imageIcons: Record<FOOD_TYPES, { src: string; alt: string }> = {
    mixed: { src: Mixed, alt: "Mixed" },
    alcohol: { src: Alcohol, alt: "Alcohol" },
    nonalcohol: { src: NonAlcohol, alt: "NonAlcohol" },
  };

  const classes: Record<
    Exclude<FOOD_TYPES, "MIXED" | "ALCOHOL" | "NON_ALCOHOL">,
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
  };

  return (
    <div className="flex flex-row my-auto space-x-2 shrink-0">
      {types?.map((type, index) => {
        const sanitizedType = type.replace(/[^a-zA-Z]/g, "").toLowerCase();
        const currentType = sanitizedType as FOOD_TYPES;

        // Check if the current type has an image associated with it
        if (imageIcons[currentType]) {
          const { src, alt } = imageIcons[currentType];
          return (
            <div
              key={index}
              className={cn("flex flex-row", !showCart ? "-mt-2 -mb-8" : "")}
            >
              <Image
                src={src}
                width={20}
                height={20}
                alt={alt}
                loading="lazy"
              />
            </div>
          );
        }

        // Render default circles for other types
        const { border, circle } = classes[currentType] || classes.other;
        return (
          <div
            key={index}
            className={`flex flex-row w-5 h-5 border-2 rounded-md ${border}`}
          >
            <div
              className={`m-auto rounded-full w-[0.5rem] h-[0.5rem] ${circle}`}
            />
          </div>
        );
      })}
    </div>
  );
};

const MemoFoodType = memo(FoodType);
export default MemoFoodType;
