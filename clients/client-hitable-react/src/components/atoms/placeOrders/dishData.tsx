import { memo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import type { DishType } from "@hi/db-models/src/validators";
import FoodType from "../dishType";
import DishQuantityButton from "./dishQuantityBtn";

interface CompactDishGridProps {
  selectedCategory: {
    dishIds: DishType[];
  };
}

const MemoCompactDishGrid = ({ selectedCategory }:CompactDishGridProps) => {
    return (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 pb-[7rem]">
            {selectedCategory?.dishIds?.map((dish: DishType, index: number) => (
                <motion.div
                    key={dish?._id?.toString()}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                >
                    <Card className="h-full overflow-hidden">
                        <CardContent className="grid grid-rows-[auto_1fr_auto_auto] h-full p-3 gap-x-2 relative ">
                            <h3 className="text-sm font-semibold">{dish.name}</h3>

                            <div className="grid grid-cols-[auto_1fr] gap-2 items-center mt-5">
                                {dish.dishTypes && (
                                    <div>
                                        <FoodType types={dish.dishTypes} />
                                    </div>
                                )}
                                <span className="text-sm font-semibold">₹{dish.portions?.length ? dish.portions[0].price : dish.price}</span>
                            </div>

                            {dish.availability && (
                                <div className="flex items-center justify-end -mt-7">
                                    <DishQuantityButton dishData={dish} />
                                </div>
                            )}

                            {(dish.addOnIds?.length || dish.portions?.length) > 0 && (
                                <span className="text-xs absolute bg-white h-4 right-10 bottom-1.5 opacity-50 text-[#000000] mt-1">
                                    options
                                </span>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    )
}

const CompactDishGrid = memo(MemoCompactDishGrid);
export default CompactDishGrid;
