import { memo, useEffect, useMemo } from "react";
import type { DishType } from "@hi/db-models/src/validators";
import { useCartStore } from "@/components/store/useCartStore";
import useBusinessDetails from "@/components/store/useBusinessDetails";

function MemoChoosePortions({ dishData }: { dishData: DishType }) {
  const selectedPortion = useCartStore((state) => state.selectedPortion);
  const setSelectedPortion = useCartStore((state) => state.setSelectedPortion);


  const portions = useMemo(() => dishData?.portions || [], [dishData]);
  const outletInfo = useBusinessDetails((s) => s.businessDetails);

    useEffect(() => {
    if (selectedPortion?._id !== portions[0]._id) {
      setSelectedPortion(portions[0]);
    }
  }, [portions, selectedPortion, setSelectedPortion]);

  return (
    <>
      {portions?.length > 0 ? (
        <div className="mx-4">
          <div className="prose">
            <h3 className="text-[#000000] !text-xl">Choose a portion</h3>
          </div>

          <div className="my-2 overflow-x-auto border rounded-lg border-[#000000]">
            <table className="table w-full my-0 overflow-hidden table-compact table-zebra">
              <tbody>
                {portions.map((portion, index) => (
                  <tr
                    className="flex flex-row my-3"
                    key={`${portion?.name?.replaceAll(" ", "") || ""}${index}`}
                    onClick={() => setSelectedPortion(portion)}
                    onKeyDown={() => setSelectedPortion(portion)}
                  >
                    <td className="!text-xs w-[2rem] text-center flex flex-row">
                      <input
                        type="radio"
                        name="portion"
                        className="p-1 ml-auto mr-2 text-2xl text-black radio"
                        checked={selectedPortion?._id === portion._id}
                      />
                    </td>
                    <td className="!text-sm w-[90%] flex flex-row flex-wrap">
                      <span className="w-full my-auto capitalize whitespace-pre-wrap">
                        {portion?.name || ""}
                      </span>
                    </td>
                    <td className="!text-sm w-[20%] text-center font-semibold flex flex-row">
                      {portion?.price > 1 && (
                        <span className="mx-auto">
                          {outletInfo?.currencySymbol} {portion?.price || 0}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </>
  );
}

const ChoosePortions = memo(MemoChoosePortions);
export default ChoosePortions;
