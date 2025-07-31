import { apiRpc } from "@hi/common";
import type { CategoryType } from "@hi/db-models/src/validators";
import { useQuery } from "@tanstack/react-query";
import { memo } from "react";
import { useParams } from "react-router-dom";
import SpinnerMemo from "../loadingSpinner";
import { motion } from "framer-motion";
import CompactDishGrid from "./dishData";
import { useOrderStore } from "@/components/store/useOrderData";
import LiveCart from "./liveCart";
import Subtypes from "./subtypes";
import SearchComponent from "./searchComponent";

const MemoCategory = () => {
  const { businessId } = useParams();
  const selectedCategory = useOrderStore((s) => s.selectedCategory);
  const setAllCategories = useOrderStore((s) => s.setAllCategories);
  const setFirstCat = useOrderStore((s) => s.setFirstCat);
  const setAllDishes = useOrderStore((s) => s.setAllDishes);
  const getChildCategories = async () => {
    const childCategories = await apiRpc.categories.$get({
      query: {
        businessId: businessId || "",
        dishes: "true",
      },
    });
    const response = await childCategories.json();
    setAllCategories(response.data as CategoryType[]);
    setAllDishes(response?.data.flatMap((cat) => cat.dishIds || []));
    if (selectedCategory === null) {
      setFirstCat(response.data);
      return response.data as CategoryType[];
    }
    return response.data as CategoryType[];
  };

  console.log("MemoCategory");
  const { isLoading, error } = useQuery({
    queryKey: ["getChildCategories", businessId],
    queryFn: getChildCategories,
    enabled: !!businessId,
    staleTime: 1000 * 30,
  });

  if (isLoading) {
    return <SpinnerMemo />;
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 text-center text-red-500"
      >
        Error loading categories.
      </motion.div>
    );
  }

  return (
    <div className="flex h-[100dvh] pt-[4.25rem] lg:pt-[7.25rem] hide-scrollbar">
      <Subtypes />

      {/* Main Content: Dishes */}
      <div className="w-3/4 p-2 md:p-4 overflow-auto pb-[5rem] border-l border-gray-200">
        <SearchComponent />
        <h2 className="pt-6 mb-6 text-xl font-bold">
          {selectedCategory ? selectedCategory.name : "Select a category"}
        </h2>
        <CompactDishGrid selectedCategory={selectedCategory} />
      </div>
      <LiveCart />
    </div>
  );
};

const Category = memo(MemoCategory);
export default Category;
