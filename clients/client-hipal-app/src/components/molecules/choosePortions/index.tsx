import React, { memo, useMemo } from "react";
import type { IDish } from "@/components/types/businessData";
import { getPrice } from "@/components/utils/helpers";
import { useDishStore } from "@/components/store/useDishStore";

// Props now include selectedPortion and onSelectPortion to manage state
function ChoosePortions({ dishData }: { dishData: IDish }) {
  const {
    selectedPortion,
    setSelectedPortion,
  } = useDishStore();

  const portions = useMemo(() => dishData?.portions || [], [dishData]);
  console.log(portions, selectedPortion);
  if (portions.length === 0) {
    return null;
  }

  return (
    <div className="mx-6">
      <div className="prose">
        <h3 className="text-base-content !text-xl">Choose a portion</h3>
      </div>

      <div className="my-2 overflow-x-auto border rounded-lg border-primary">
        <div className="px-3 py-3 prose">
          <h4 className="text-xs font-semibold text-base-content">Portion</h4>
        </div>

        <table className="table w-full overflow-hidden table-compact table-zebra">
          <tbody>
            {portions.map((portion, index) => (
              <tr
                className="flex flex-row "
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
                    className="p-1 ml-auto mr-2 radio radio-secondary radio-sm"
                    checked={selectedPortion === portion.name}
                    onChange={() =>
						setSelectedPortion(portion.name, portion.price)
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
