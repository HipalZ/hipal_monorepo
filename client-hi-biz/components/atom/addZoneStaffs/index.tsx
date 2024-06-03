import { useSearch } from "@/components/store/useSearch";
import type { IStaffs } from "@/components/types/businessData";
import React, { memo, useEffect, useMemo, useState } from "react";
import { BsFillPersonFill } from "react-icons/bs";
import SearchPanel from "../searchPanel";

const AddZoneStaffs = ({
  handleData,
  Data,
  selectedData
}: {
  handleData: any;
  Data: IStaffs[];
  selectedData: IStaffs[];
}) => {
  const [activeClick, setActiveClick] = useState<Array<Record<string, any>>>(
    []
  );
  const searchText = useSearch((s) => s.searchText);
  const setSearchText = useSearch((s) => s.setSearchText);
  useEffect(() => {
    setSearchText('')
  }, [])
  const closeSearchBox = () => {
  };
  useEffect(() => {
    setActiveClick(selectedData)
  }, [selectedData])

  const staffData = useMemo(() => (Data || []).filter((data) => data?.name?.toLowerCase()?.includes(searchText?.toLowerCase()),
  ), [Data, searchText],)

  function handleActiveClick(selectedData: any) {
    setActiveClick((prev: any) => {
      const index = prev.findIndex((item: any) => item.id === selectedData.id);
      if (index !== -1) {
        return prev.filter((item: any) => item.id !== selectedData.id);
      }
        return [...prev, selectedData];
    });
  }

  return (
    <div className="bg-[#F5F5F5] rounded-t-[1.5rem]">
      <div className="px-6 py-5 overflow-y-auto max-h-[85vh]">
        <h1 className="text-2xl text-[#2B354D]">Add staff to the zone</h1>
        <SearchPanel closeSearchBox={closeSearchBox} />
        {searchText === "" ? Data?.map((eachData: IStaffs) =>
        (
          <div
            key={eachData.id}
            onClick={() => handleActiveClick(eachData)}
            className={`${activeClick?.some(item => item.id === eachData.id)
              ? "border-[#2B354D] border-2"
              : "border-1 border-[#CACACA]"
              } bg-white rounded-md my-5 p-3 border`}
          >
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={activeClick?.some(item => item.id === eachData.id)}
                className="mr-2 rounded-sm"
              />
              <BsFillPersonFill />
              <h1 className="mx-2 text-base">{eachData?.name}</h1>
            </div>
            <div className="flex justify-between mt-2">
              <p className="text-sm text-[#2B354D]/70">
                {eachData?.customRole?.[0]?.roleName}
              </p>
            </div>
          </div>
        )
        ) : staffData?.map((eachData) => (<div
          key={eachData.id}
          onClick={() => handleActiveClick(eachData)}
          className={`${activeClick?.some(item => item.id === eachData.id)
            ? "border-[#2B354D] border-2"
            : "border-1 border-[#CACACA]"
            } bg-white rounded-md my-5 p-3 border`}
        >
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={activeClick?.some(item => item.id === eachData.id)}
              className="mr-2 rounded-sm"
            />
            <BsFillPersonFill />
            <h1 className="mx-2 text-base">{eachData?.name}</h1>
          </div>
          <div className="flex justify-between mt-2">
            <p className="text-sm text-[#2B354D]/70">
              {eachData?.customRole?.[0]?.roleName}
            </p>
          </div>
        </div>))}
        <div className="sticky my-6 bottom-5">
          <button
            type="button"
            onClick={() => {
              handleData(activeClick)
            }}
            className="on_active_bounce text-white rounded-md bg-[#2B354D] py-2.5 w-full"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(AddZoneStaffs);
