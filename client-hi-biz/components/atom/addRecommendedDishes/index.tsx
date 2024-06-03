import React, { memo, useEffect, useMemo, useState } from "react";
import type { Category, IDish } from "@/components/types/businessData";
import SearchPanel from "../searchPanel";
import { useSearch } from "@/components/store/useSearch";

type DataArray = IDish[] | Category[];
const AddRecommendedDishes = <T extends DataArray>({
  handleData,
  Data,
  closeRecommendPopup,
  selectedData,
  headerText
}: {
  handleData: (selectedDishes: T) => void;
  Data: T;
  closeRecommendPopup: () => void;
  selectedData: DataArray,
  headerText: string
}) => {
  const [recommendDish, setRecommendDish] = useState<IDish[] | Category[]>([]);
  const searchText = useSearch((s) => s.searchText);
  const setSearchText = useSearch((s) => s.setSearchText);
  useEffect(() => {
    setSearchText('')
  }, [])
  const closeSearchBox = () => {
  };
  useEffect(() => {
    setRecommendDish(selectedData)
  }, [])
  let dishData = useMemo(
    () =>
      (Data || []).filter((dish) =>
        dish?.name?.toLowerCase()?.includes(searchText?.toLowerCase()),
      ),
    [Data, searchText],
  )
  function handleActiveClick(selectedData: IDish | Category) {
    setRecommendDish((prev) => {
      const index = prev.findIndex((item) => item.id === selectedData.id);
      if (index !== -1) {
        return prev.filter((item) => item.id !== selectedData.id);
      }
      return [...prev, { id: selectedData.id, name: selectedData.name }];
    });
  }

  return (
    <div className="bg-[#F5F5F5] rounded-t-[1.5rem]">
      <div className="px-6 py-5 overflow-y-auto max-h-[85vh]">
        <h1 className="text-2xl text-[#2B354D] mb-2">Add {headerText}</h1>
        <SearchPanel closeSearchBox={closeSearchBox} />
        {searchText === '' ? Data?.map((eachData) => (
          <div
            key={eachData.id}
            onClick={() => handleActiveClick(eachData)}
            className={`${recommendDish.some((item) => item.id === eachData.id)
              ? "border-[#2B354D] border-2"
              : "border-1 border-[#CACACA]"
              } bg-white rounded-md my-5 p-3 border`}
          >
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={recommendDish?.some((item) => item.id === eachData.id)}
                className="mr-2 rounded-sm"
              />
              <h1 className="mx-2 text-base">{eachData.name}</h1>
            </div>
          </div>
        )) : dishData?.map((eachData) => (
          <div
            key={eachData?.id}
            onClick={() => handleActiveClick(eachData)}
            className={`${recommendDish?.some((item) => item.id === eachData.id)
              ? "border-[#2B354D] border-2"
              : "border-1 border-[#CACACA]"
              } bg-white rounded-md my-5 p-3 border`}
          >
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={recommendDish?.some((item) => item.id === eachData.id)}
                className="mr-2 rounded-sm"
              />
              <h1 className="mx-2 text-base">{eachData.name}</h1>
            </div>
          </div>
        ))
        }
        <div className="sticky flex my-6 bottom-5">
          <button type="button" onClick={closeRecommendPopup} className="border border-1 border-[#2B354D] on_active_bounce text-[#2B354D] rounded-md bg-white py-2.5 w-full mr-2">
            Cancel
          </button>
          <button type="button"
            onClick={() => handleData(recommendDish)}
            className={`${recommendDish?.length>0 ? '' : 'opacity-50 pointer-events-none'} on_active_bounce text-white rounded-md bg-[#2B354D] py-2.5 w-full`}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(AddRecommendedDishes);
