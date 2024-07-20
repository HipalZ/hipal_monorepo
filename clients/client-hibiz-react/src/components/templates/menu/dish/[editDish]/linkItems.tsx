import type { ICategory } from "@/components/types/businessData";
import Fuse from "fuse.js";
import { memo, useEffect, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import useMenuPageStore, { DishSteps } from "@/components/store/useMenuStorage";
import type { DishType } from "@hi/db-models/src/validators";

interface Props {
  categoryData?: ICategory[];
  dishesData?: DishType[];
}
const MemoLinkItems = (props: Props) => {
  const { categoryData, dishesData } = props;
  console.log("dis", dishesData);
  const [tempIds, setTempIds] = useState<string[]>([]);
  const [removeIds, setRemoveIds] = useState<string[]>([]);
  const {
    setSelectedCatIds,
    dishStep,
    selectedCatIds,
    setDishStep,
    recommendationIds,
    setRecommendationIds,
    setRemoveCategoryIds,
    setRemoveRecommendationIds,
    removeCategoryIds,
  } = useMenuPageStore((s) => ({
    setSelectedCatIds: s.setSelectedCatIds,
    selectedCatIds: s.selectedCatIds,
    dishStep: s.dishStep,
    setDishStep: s.setDishStep,
    recommendationIds: s.recommendationIds,
    setRecommendationIds: s.setRecommendationIds,
    setRemoveCategoryIds: s.setRemoveCategoryIds,
    setRemoveAddOnIds: s.setRemoveAddOnIds,
    setRemoveRecommendationIds: s.setRemoveRecommendationIds,
    removeCategoryIds: s.removeCategoryIds,
  }));
  const [searchTerm, setSearchTerm] = useState("");
  const fuse = new Fuse(categoryData || dishesData, {
    keys: ["name"],
    threshold: 0.3,
  });

  // Original filteredData computation with added sorting to bring selected items to the top
  let filteredData = searchTerm
    ? fuse.search(searchTerm).map((result) => result.item)
    : categoryData || dishesData;
  filteredData = [...filteredData].sort((a, b) => {
    const aIsSelected = tempIds.includes(a._id?.toString() ?? "");
    const bIsSelected = tempIds.includes(b._id?.toString() ?? "");
    return aIsSelected === bIsSelected ? 0 : aIsSelected ? -1 : 1;
  });
  const handleSave = () => {
    if (dishStep === "LINK_CATEGORY_STEP") {
      setSelectedCatIds(tempIds);
      setDishStep(DishSteps.DISH_STEP_1);
      setRemoveCategoryIds(removeIds);
    } else if (dishStep === "LINK_RECOMMENDATION_STEP") {
      setRecommendationIds(tempIds);
      setDishStep(DishSteps.DISH_STEP_2);
      setRemoveRecommendationIds(removeIds);
    }
  };

  const handleDataChange = (id: string) => {
    if (tempIds.includes(id)) {
      setTempIds(tempIds.filter((catId) => catId !== id));
      if (!removeIds.includes(id)) {
        setRemoveIds([...removeIds, id]);
      }
    } else {
      setTempIds([...tempIds, id]);
      setRemoveIds(removeCategoryIds.filter((catId) => catId !== id));
    }
  };

  useEffect(() => {
    if (dishStep === "LINK_CATEGORY_STEP") {
      setTempIds(selectedCatIds);
    } else if (dishStep === "LINK_RECOMMENDATION_STEP") {
      setTempIds(recommendationIds);
    }
  }, [dishStep]);

  return (
    <>
      <input
        type="search"
        placeholder="Search Item..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className=" w-[92%] p-2 border rounded-2xl mx-6"
      />
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {filteredData?.map((data) => (
          <div
            key={data._id?.toString()}
            className="flex relative items-center justify-between w-[90%] p-4 bg-white rounded-lg shadow md:max-w-[14rem] lg:max-w-[14rem]"
          >
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={tempIds.includes(data._id?.toString() ?? "")}
                onChange={() => handleDataChange(data._id?.toString() ?? "")}
                className="mr-2 text-sm text-black rounded-md"
              />
              <h3 className="text-lg font-semibold truncate w-[80%]">
                {data.name}
              </h3>
            </label>
            <div className="absolute right-2">
              {data.visibility ? (
                <FaEye className="text-green-500" />
              ) : (
                <FaEyeSlash className="text-red-500" />
              )}
            </div>
          </div>
        ))}
      </div>
      <button type="button" onClick={handleSave} className="bottom_btn">
        Save
      </button>
    </>
  );
};

const LinkItems = memo(MemoLinkItems);
export default LinkItems;
