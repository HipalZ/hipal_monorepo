import Image from "next/image";
import { memo } from "react";
import Alcohol from "@/assets/alcohol.png";
import NonAlcohol from "@/assets/NonAlcohol.png";

export type FOOD_TYPES =
  | "VEG"
  | "EGG"
  | "NON_VEG"
  | "VEGAN"
  | "OTHER"
  | "ALCOHOL"
  | "NON_ALCOHOL";

const FoodType = ({ types }: { types: FOOD_TYPES[] }) => {
  const imageIcons: Record<string, { src: string; alt: string }> = {
    alcohol: { src: Alcohol, alt: "Alcohol" },
    nonalcohol: { src: NonAlcohol, alt: "NonAlcohol" },
  };

  const classes: Record<
    string,
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
    <div className="flex items-center space-x-2">
      {types?.map((type, index) => {
        const sanitizedType = type.replace(/[^a-zA-Z]/g, "").toLowerCase();
        const currentType = sanitizedType as string;

        if (imageIcons[currentType]) {
          const { src, alt } = imageIcons[currentType];
          return (
            <div key={index}>
              <Image
                src={src}
                width={20}
                height={20}
                alt={alt}
                loading="lazy"
                className="my-0"
              />
            </div>
          );
        }

        const { border, circle } = classes[currentType] || classes.other;
        return (
          <div
            key={index}
            className={`w-4 h-4 border-2 rounded-md ${border} flex items-center justify-center`}
          >
            <div className={`rounded-full w-1.5 h-1.5 ${circle}`} />
          </div>
        );
      })}
    </div>
  );
};

const MemoFoodType = memo(FoodType);
export default MemoFoodType;
