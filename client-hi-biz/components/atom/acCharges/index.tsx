import React, { memo, useEffect, useState } from "react";
import type { Category, ICharges, IDish } from "@/components/types/businessData";
import { RiExchangeDollarLine } from "react-icons/ri";

type DataArray = IDish[] | Category[];
const ACCharges = ({
  handleACCharges,
  acCharges,
  selectedData,
}: {
  handleACCharges: any;
  acCharges: ICharges[];
  selectedData: ICharges[];
}) => {
  const [activeClick, setActiveClick] = useState<ICharges[]>(
    []
  );

  useEffect(() => {
    setActiveClick(selectedData)
  }, [selectedData])

  function handleActiveClick(selectedData: ICharges[]) {
    setActiveClick((prev) => {
      const index = prev.findIndex((item) => item._id === selectedData?._id);
      if (index !== -1) {
        return prev.filter((item) => item._id !== selectedData?._id);
      } {
        return [...prev, selectedData];
      }
    });
  }

  return (
    <div className="bg-[#F5F5F5] rounded-t-[1.5rem]">
      <div className="px-6 py-5 overflow-y-auto max-h-[85vh]">
        <h1 className="text-2xl text-[#2B354D]">Add Charges to the zone</h1>
        {acCharges?.map((charge: ICharges) => (
          <div
            key={charge._id}
            onClick={() => handleActiveClick(charge)}
            className={`${activeClick?.some((item) => item._id === charge._id)
              ? "border-[#2B354D] border-2"
              : "border-1 border-[#CACACA]"
              } bg-white rounded-md my-5 p-3 border`}
          >
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={activeClick?.some((item) => item._id === charge._id)}
                className="mr-2 rounded-sm"
              />
              <RiExchangeDollarLine />
              <h1 className="mx-2 text-base">{charge?.chargeName}</h1>
            </div>
            <div className="flex justify-between mt-4">
              <p className="text-sm text-[#2B354D]/70">
                {charge?.value}% billing
              </p>
            </div>
          </div>
        ))}
        <div className="sticky flex my-6 bottom-5">
          <button
            type="button"
            onClick={() => handleACCharges(activeClick)}
            className="on_active_bounce text-white rounded-md bg-[#2B354D] py-2.5 w-full"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(ACCharges);
