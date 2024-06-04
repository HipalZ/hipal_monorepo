import React, { memo, useEffect, useMemo, useState } from "react";
import type { Extra, IDish } from "@/components/types/businessData";
import SearchPanel from "../searchPanel";
import { useSearch } from "@/components/store/useSearch";

const AddExtras = ({
  handleData,
  Data,
  selectedData,
  closeAddOnPopUp
}: {
  handleData: (selectedDishes: Extra[]) => void;
  Data: Extra[];
  selectedData: IDish[] | any;
  closeAddOnPopUp: () => void;
}) => {
  const [extras, setExtras] = useState<Extra[]>([]);
  const searchText = useSearch((s) => s.searchText);

  useEffect(() => {
    setExtras(selectedData);
  }, [selectedData]);

  function handleActiveClick(selectedData: Extra) {
    setExtras((prev: any) => {
      const index = prev.findIndex(
        (item: Extra) => item._id === selectedData._id
      );
      if (index !== -1) {
        return prev.filter((item: Extra) => item._id !== selectedData._id);
      }
        return [...prev, selectedData];
    });
  }

  const extrasData = useMemo(
    () =>
      (Data || []).filter((dish) =>
        dish?.name?.toLowerCase()?.includes(searchText?.toLowerCase()),
      ),
    [Data, searchText],
  )
  return (
    <div className="bg-[#F5F5F5] rounded-t-[1.5rem]">
      <div className="px-6 py-5 overflow-y-auto max-h-[85vh]">
        <h1 className="text-2xl text-[#2B354D] mb-2">Add Addons</h1>
        <SearchPanel />
        {searchText === '' ? Data?.map((eachData) => (
          <div
            key={eachData._id}
            onClick={() => handleActiveClick(eachData)}
            className={`${extras.some((item) => item._id === eachData._id)
              ? "border-[#2B354D] border-2"
              : "border-1 border-[#CACACA]"
              } bg-white rounded-md my-5 p-3 border`}
          >
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={extras.some((item) => item._id === eachData._id)}
                className="mr-2 rounded-sm"
              />
              <h1 className="mx-2 text-base">{eachData.name}</h1>
            </div>
          </div>
        )) : extrasData?.map((eachData) => (
          <div
            key={eachData._id}
            onClick={() => handleActiveClick(eachData)}
            className={`${extras.some((item) => item._id === eachData._id)
              ? "border-[#2B354D] border-2"
              : "border-1 border-[#CACACA]"
              } bg-white rounded-md my-5 p-3 border`}
          >
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={extras.some((item) => item._id === eachData._id)}
                className="mr-2 rounded-sm"
              />
              <h1 className="mx-2 text-base">{eachData.name}</h1>
            </div>
          </div>
        ))}
        <div className="sticky flex my-6 bottom-5">
          <button type="button" onClick={closeAddOnPopUp} className="border border-1 border-[#2B354D] on_active_bounce text-[#2B354D] rounded-md bg-white py-2.5 w-full mr-2">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleData(extras)}
            className={`${extras?.length > 0 ? '' : 'opacity-50 pointer-events-none'} on_active_bounce text-white rounded-md bg-[#2B354D] py-2.5 w-full`}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(AddExtras);
