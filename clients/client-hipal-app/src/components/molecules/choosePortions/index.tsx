import React, { memo, useCallback, useMemo } from "react";
import { getPrice } from "@/components/utils/helpers";
import type { DishType } from "@hi/db-models/src/validators";
import { useCartStore } from "@/components/store/useCartStore";

function ChoosePortions({ dishData }: { dishData: DishType }) {
  const { selectedPortion, setSelectedPortion } = useCartStore((state) => ({
    selectedPortion: state.selectedPortion,
    setSelectedPortion: state.setSelectedPortion,
  }));

  const portions = useMemo(() => dishData?.portions || [], [dishData]);

  if (portions.length === 0) {
    return null;
  }

  const handlePortionSelect = useCallback(
    (portion: {
      _id: number;
      name: string;
      price: number;
    }) => {
      setSelectedPortion(portion);
    },
    [],
  );

  return (
    <div className="mx-6">
      <div className="prose">
        <h3 className="text-base-content !text-xl">Choose a portion</h3>
      </div>

      <div className="my-2 overflow-x-auto border rounded-lg border-primary">
        <div className="px-3 py-3 prose">
          <h4 className="text-xs font-semibold text-base-content">Portion</h4>
        </div>

        <table className="table w-full my-0 overflow-hidden table-compact table-zebra">
          <tbody>
            {portions.map((portion, index) => (
              <tr
                className={`flex flex-row ${
                  selectedPortion?._id === portion._id ? "bg-gray-200" : ""
                }`}
                key={`${portion?.name?.replaceAll(" ", "") || ""}${index}`}
              >
                <td className="!pl-3 !text-xs w-1/3 flex flex-row flex-wrap">
                  <span className="w-full my-auto capitalize whitespace-pre-wrap">
                    {portion?.name || ""}
                  </span>
                </td>
                <td className="!text-xs w-1/3 text-center font-semibold flex flex-row">
                  <span className="mx-auto">
                    {getPrice(portion?.price || 0)}
                  </span>
                </td>
                <td className="!text-xs w-1/3 text-center flex flex-row">
                  <input
                    type="radio"
                    className="p-1 ml-auto mr-2 text-2xl transform scale-150"
                    checked={selectedPortion?._id === portion._id}
                    onClick={() =>
                      handlePortionSelect({
                        _id: portion._id,
                        name: portion.name,
                        price: portion.price,
                      })
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default memo(ChoosePortions);
